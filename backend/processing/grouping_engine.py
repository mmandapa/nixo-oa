"""
Intelligent grouping engine for related messages
"""
import logging
from typing import Optional, Dict, Any, List
from backend.database.tickets import TicketRepository
from backend.config import settings

logger = logging.getLogger(__name__)


class GroupingEngine:
    """
    Groups related messages into tickets using:
    P1: Thread-based grouping (strongest signal)
    P2: Semantic similarity (AI-powered)
    """
    
    def __init__(self):
        self.ticket_repo = TicketRepository()
        self.SIMILARITY_THRESHOLD = settings.SIMILARITY_THRESHOLD
        self.TIME_WINDOW_MINUTES = settings.TIME_WINDOW_MINUTES
    
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
        
        # PRIORITY 2: Semantic similarity
        ticket = await self._find_by_similarity(
            embedding,
            channel_id,
            category
        )
        if ticket:
            logger.info(
                f"Grouped by similarity: {ticket['id']} "
                f"(score: {ticket.get('similarity', 0):.3f})"
            )
            return ticket
        
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
        - Same category preferred (but not required)
        """
        similar_tickets = await self.ticket_repo.find_similar(
            embedding=embedding,
            channel_id=channel_id,
            time_window_minutes=self.TIME_WINDOW_MINUTES,
            similarity_threshold=self.SIMILARITY_THRESHOLD,
            max_results=5
        )
        
        if not similar_tickets:
            return None
        
        # Prefer same category if available
        for ticket in similar_tickets:
            if ticket.get("category") == category:
                return ticket
        
        # Otherwise return most similar
        return similar_tickets[0] if similar_tickets else None
    
    async def _create_ticket(
        self,
        message_text: str,
        embedding: List[float],
        category: str,
        channel_id: str,
        first_message_ts: str
    ) -> Dict[str, Any]:
        """Create new ticket"""
        # Extract title (first 150 chars, clean)
        title = message_text[:150].strip()
        if len(message_text) > 150:
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

