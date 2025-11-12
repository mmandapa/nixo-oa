"""
Message database operations
"""
import logging
from typing import Dict, Any, Optional
from backend.database.client import supabase_client

logger = logging.getLogger(__name__)


class MessageRepository:
    """Repository for message database operations"""
    
    async def find_by_slack_id(self, slack_message_id: str) -> Optional[Dict[str, Any]]:
        """
        Find message by Slack message ID (for de-duplication)
        
        Args:
            slack_message_id: Format "{channel_id}:{ts}"
            
        Returns:
            Message dict or None
        """
        try:
            result = supabase_client.table("messages").select("*").eq(
                "slack_message_id", slack_message_id
            ).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error finding message by Slack ID: {e}", exc_info=True)
            return None
    
    async def create(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create new message
        
        Args:
            message_data: Message data dict
            
        Returns:
            Created message dict
        """
        try:
            result = supabase_client.table("messages").insert(message_data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error creating message: {e}", exc_info=True)
            raise
    
    async def get_by_ticket(self, ticket_id: str) -> list[Dict[str, Any]]:
        """
        Get all messages for a ticket
        
        Args:
            ticket_id: Ticket UUID
            
        Returns:
            List of message dicts
        """
        try:
            result = supabase_client.table("messages").select("*").eq(
                "ticket_id", ticket_id
            ).order("created_at", desc=False).execute()
            
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error getting messages by ticket: {e}", exc_info=True)
            return []

