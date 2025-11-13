"""
Intelligent grouping engine for related messages
"""
import logging
from typing import Optional, Dict, Any, List
from backend.database.tickets import TicketRepository
from backend.database.messages import MessageRepository
from backend.config import settings
from backend.ai.grouping_classifier import GroupingClassifier
from backend.ai.title_generator import TitleGenerator

logger = logging.getLogger(__name__)


class GroupingEngine:
    """
    Groups related messages into tickets using:
    P1: Thread-based grouping (strongest signal)
    P2: Semantic similarity (AI-powered)
    """
    
    def __init__(self):
        self.ticket_repo = TicketRepository()
        self.message_repo = MessageRepository()
        self.grouping_classifier = GroupingClassifier()
        self.title_generator = TitleGenerator()
        self.SIMILARITY_THRESHOLD = settings.SIMILARITY_THRESHOLD
        self.TIME_WINDOW_MINUTES = settings.TIME_WINDOW_MINUTES
        self.AI_GROUPING_CONFIDENCE_THRESHOLD = 0.75  # Minimum confidence for AI grouping
    
    async def find_or_create_ticket(
        self,
        message_text: str,
        embedding: List[float],
        category: str,
        channel_id: str,
        thread_ts: Optional[str],
        message_ts: str
    ) -> Dict[str, Any]:
        """
        Find existing ticket or create new one
        
        Priority order:
        1. Thread-based (if thread_ts exists)
        2. Semantic similarity (vector search)
        3. Create new ticket
        
        Args:
            message_text: Message text
            embedding: Message embedding vector
            category: Message category
            channel_id: Slack channel ID
            thread_ts: Thread timestamp (if in thread)
            message_ts: Message timestamp
            
        Returns:
            Ticket dict
        """
        
        # PRIORITY 1: Thread-based grouping
        if thread_ts:
            ticket = await self._find_by_thread(thread_ts, channel_id)
            if ticket:
                logger.info(f"Grouped by thread: {ticket['id']}")
                return ticket
        
        # PRIORITY 2: AI-based grouping (check recent tickets with AI)
        logger.info(f"🔍 Searching for related tickets using AI in channel {channel_id}")
        ticket = await self._find_by_ai_grouping(
            message_text,
            channel_id,
            category
        )
        if ticket:
            logger.info(
                f"✅ Grouped by AI: {ticket['id']} "
                f"(category: {ticket.get('category')} vs {category})"
            )
            return ticket
        else:
            logger.info("No AI grouping match found - trying similarity search")
        
        # PRIORITY 3: Semantic similarity (fallback)
        logger.debug(f"Searching for similar tickets using embeddings in channel {channel_id}")
        ticket = await self._find_by_similarity(
            embedding,
            channel_id,
            category
        )
        if ticket:
            similarity_score = ticket.get('similarity', 0)
            logger.info(
                f"✅ Grouped by similarity: {ticket['id']} "
                f"(score: {similarity_score:.3f}, "
                f"category: {ticket.get('category')} vs {category})"
            )
            return ticket
        else:
            logger.debug("No similar tickets found - will create new ticket")
        
        # No match found -> Create new ticket
        logger.info(f"Creating new ticket for: {message_text[:50]}")
        ticket = await self._create_ticket(
            message_text,
            embedding,
            category,
            channel_id,
            thread_ts or message_ts
        )
        
        return ticket
    
    async def _find_by_thread(
        self,
        thread_ts: str,
        channel_id: str
    ) -> Optional[Dict[str, Any]]:
        """Find ticket by thread timestamp (strongest signal)"""
        return await self.ticket_repo.find_by_thread(thread_ts, channel_id)
    
    async def _find_by_ai_grouping(
        self,
        message_text: str,
        channel_id: str,
        category: str
    ) -> Optional[Dict[str, Any]]:
        """
        Find related tickets using AI-based grouping
        Checks recent tickets (last 24 hours) to see if they're about the same issue
        """
        try:
            # Get recent tickets from same channel (last 24 hours, no time limit for AI)
            # We'll search a wider window since AI can handle context better
            logger.info(f"Fetching recent tickets (last 24h) for AI grouping check...")
            recent_tickets = await self.ticket_repo.find_recent_tickets(
                channel_id=channel_id,
                hours=24,  # Check last 24 hours
                limit=10  # Check top 10 most recent
            )
            
            logger.info(f"Found {len(recent_tickets)} recent tickets to check with AI")
            
            if not recent_tickets:
                logger.debug("No recent tickets found for AI grouping")
                return None
            
            # Get first message from each ticket for comparison
            for ticket in recent_tickets:
                ticket_id = ticket.get("id")
                ticket_title = ticket.get("title", "")
                
                # Get first message from this ticket
                messages = await self.message_repo.get_by_ticket(ticket_id)
                if not messages:
                    continue
                
                first_message = messages[0].get("text", "")
                
                # Use AI to check if messages are about same issue
                logger.info(
                    f"🤖 AI checking: '{message_text[:50]}...' vs ticket '{ticket_title[:50]}...'"
                )
                is_same, confidence, reasoning = await self.grouping_classifier.are_same_issue(
                    message1=first_message,
                    message2=message_text,
                    ticket_title=ticket_title
                )
                
                logger.info(
                    f"AI result: same={is_same}, confidence={confidence:.2f}, "
                    f"reasoning={reasoning[:100]}"
                )
                
                if is_same and confidence >= self.AI_GROUPING_CONFIDENCE_THRESHOLD:
                    logger.info(
                        f"✅ AI grouping match: confidence={confidence:.2f}, "
                        f"reasoning={reasoning}"
                    )
                    return ticket
                else:
                    logger.debug(
                        f"❌ AI grouping: not same (confidence={confidence:.2f}, "
                        f"threshold={self.AI_GROUPING_CONFIDENCE_THRESHOLD}, "
                        f"reasoning={reasoning[:100]})"
                    )
            
            return None
        
        except Exception as e:
            logger.error(f"Error in AI-based grouping: {e}", exc_info=True)
            # Fall back to similarity-based grouping
            return None
    
    async def _find_by_similarity(
        self,
        embedding: List[float],
        channel_id: str,
        category: str
    ) -> Optional[Dict[str, Any]]:
        """
        Find similar ticket using vector similarity
        
        Only searches:
        - Same channel (avoid cross-contamination)
        - Recent tickets (last 30 min)
        - Open tickets only
        - Groups by similarity regardless of category (if similarity is high enough)
        """
        similar_tickets = await self.ticket_repo.find_similar(
            embedding=embedding,
            channel_id=channel_id,
            time_window_minutes=self.TIME_WINDOW_MINUTES,
            similarity_threshold=self.SIMILARITY_THRESHOLD,
            max_results=5
        )
        
        if not similar_tickets:
            logger.debug(f"No similar tickets found (threshold: {self.SIMILARITY_THRESHOLD})")
            return None
        
        # Log similarity scores for debugging
        for ticket in similar_tickets:
            similarity = ticket.get("similarity", 0)
            logger.debug(
                f"Similar ticket found: {ticket.get('id')} "
                f"(similarity: {similarity:.3f}, category: {ticket.get('category')}, "
                f"current category: {category})"
            )
        
        # If similarity is very high (>0.85), group regardless of category
        # Otherwise prefer same category
        best_ticket = similar_tickets[0]
        best_similarity = best_ticket.get("similarity", 0)
        
        if best_similarity > 0.85:
            # Very high similarity - group regardless of category
            logger.info(
                f"Grouping by high similarity ({best_similarity:.3f}) "
                f"despite category mismatch: {best_ticket.get('category')} vs {category}"
            )
            return best_ticket
        
        # For moderate similarity, prefer same category
        for ticket in similar_tickets:
            if ticket.get("category") == category:
                logger.info(
                    f"Grouping by similarity ({ticket.get('similarity', 0):.3f}) "
                    f"with matching category: {category}"
                )
                return ticket
        
        # If no same category but similarity is still above threshold, group anyway
        # (Better to group than create duplicates)
        logger.info(
            f"Grouping by similarity ({best_similarity:.3f}) "
            f"despite category difference: {best_ticket.get('category')} vs {category}"
        )
        return best_ticket
    
    async def _create_ticket(
        self,
        message_text: str,
        embedding: List[float],
        category: str,
        channel_id: str,
        first_message_ts: str
    ) -> Dict[str, Any]:
        """Create new ticket with AI-generated title"""
        # Generate AI title based on message context
        try:
            title = await self.title_generator.generate_title(
                messages=[message_text],
                category=category
            )
            logger.info(f"Generated AI title: {title}")
        except Exception as e:
            logger.warning(f"Title generation failed, using fallback: {e}")
            # Fallback to first message preview
            title = message_text[:80].strip()
            if len(message_text) > 80:
                title += "..."
        
        ticket_data = {
            "title": title,
            "category": category,
            "status": "open",
            "channel_id": channel_id,
            "first_message_ts": first_message_ts,
            "embedding": embedding
        }
        
        return await self.ticket_repo.create(ticket_data)

