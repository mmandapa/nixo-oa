"""
De-duplication logic to prevent duplicate messages
"""
import logging
from typing import Optional
from backend.database.messages import MessageRepository

logger = logging.getLogger(__name__)


class DeduplicationChecker:
    """Checks if a message has already been processed"""
    
    def __init__(self):
        self.message_repo = MessageRepository()
    
    async def is_processed(self, slack_message_id: str) -> bool:
        """
        Check if message has already been processed
        
        Args:
            slack_message_id: Format "{channel_id}:{ts}"
            
        Returns:
            True if already processed, False otherwise
        """
        try:
            message = await self.message_repo.find_by_slack_id(slack_message_id)
            if message:
                logger.info(f"Message {slack_message_id} already processed")
                return True
            return False
        except Exception as e:
            logger.error(f"Error checking de-duplication: {e}", exc_info=True)
            # On error, assume not processed (safer to process than skip)
            return False

