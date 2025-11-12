"""
Main message processing pipeline orchestrator
"""
import asyncio
import time
import logging
from typing import Dict, Any

from backend.ai.classifier import MessageClassifier
from backend.ai.embeddings import EmbeddingGenerator
from backend.processing.grouping_engine import GroupingEngine
from backend.processing.deduplication import DeduplicationChecker
from backend.database.tickets import TicketRepository
from backend.database.messages import MessageRepository
from backend.slack.utils import SlackUtils

logger = logging.getLogger(__name__)


class MessageProcessor:
    """
    Main processing pipeline that orchestrates:
    1. De-duplication
    2. AI classification
    3. Embedding generation
    4. Intelligent grouping
    5. Database storage
    """
    
    def __init__(self):
        self.classifier = MessageClassifier()
        self.embedder = EmbeddingGenerator()
        self.grouper = GroupingEngine()
        self.dedup = DeduplicationChecker()
        self.ticket_repo = TicketRepository()
        self.message_repo = MessageRepository()
        self.slack_utils = SlackUtils()
    
    async def process_message(self, event: Dict[str, Any], slack_client) -> None:
        """
        Main processing pipeline
        
        Steps:
        1. Deduplication check
        2. AI classification (parallel with embedding)
        3. Embedding generation
        4. Intelligent grouping
        5. Database storage
        6. Enrichment
        
        Args:
            event: Slack event payload
            slack_client: Slack WebClient instance
        """
        start_time = time.time()
        
        try:
            # Extract core fields
            message_text = event.get("text", "")
            user_id = event.get("user")
            channel_id = event.get("channel")
            message_ts = event.get("ts")
            thread_ts = event.get("thread_ts")
            
            # Skip if no text
            if not message_text or not user_id or not channel_id:
                logger.warning(f"Skipping invalid event: {event}")
                return
            
            # Create unique message ID
            slack_message_id = f"{channel_id}:{message_ts}"
            
            logger.info(f"Processing message: {slack_message_id}")
            
            # STEP 1: De-duplication (CRITICAL)
            if await self.dedup.is_processed(slack_message_id):
                logger.info(f"Message {slack_message_id} already processed")
                return
            
            # STEP 2 & 3: Classification + Embedding (PARALLEL for performance)
            classification, embedding = await asyncio.gather(
                self.classifier.classify(message_text),
                self.embedder.generate(message_text)
            )
            
            # STEP 4: Check relevance
            if not classification.is_relevant:
                logger.info(f"Message not relevant: {message_text[:50]}")
                return
            
            # STEP 5: Intelligent grouping
            ticket = await self.grouper.find_or_create_ticket(
                message_text=message_text,
                embedding=embedding,
                category=classification.category or "question",
                channel_id=channel_id,
                thread_ts=thread_ts,
                message_ts=message_ts
            )
            
            # STEP 6: Enrich with Slack data (parallel)
            user_name, channel_name = await asyncio.gather(
                self.slack_utils.get_user_name(user_id, slack_client),
                self.slack_utils.get_channel_name(channel_id, slack_client)
            )
            
            # STEP 7: Store message
            await self.message_repo.create({
                "ticket_id": ticket["id"],
                "slack_message_id": slack_message_id,
                "text": message_text,
                "user_id": user_id,
                "user_name": user_name or "Unknown",
                "channel_id": channel_id,
                "thread_ts": thread_ts,
                "message_ts": message_ts
            })
            
            # Update ticket channel name if needed
            if ticket.get("channel_name") != channel_name and channel_name:
                await self.ticket_repo.update(ticket["id"], {
                    "channel_name": channel_name
                })
            
            elapsed = time.time() - start_time
            logger.info(
                f"Message processed in {elapsed:.2f}s -> Ticket {ticket['id']}"
            )
            
            if elapsed > 8:
                logger.warning(f"Processing took {elapsed:.2f}s (target: <8s)")
        
        except Exception as e:
            logger.error(f"Error processing message: {e}", exc_info=True)
            # Don't mark as processed so we can retry

