"""
Ticket database operations
"""
import logging
from typing import List, Optional, Dict, Any
from backend.database.client import supabase_client

logger = logging.getLogger(__name__)


class TicketRepository:
    """Repository for ticket database operations"""
    
    async def find_by_thread(
        self,
        thread_ts: str,
        channel_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Find ticket by thread timestamp
        
        Args:
            thread_ts: Slack thread timestamp
            channel_id: Slack channel ID
            
        Returns:
            Ticket dict or None
        """
        try:
            result = supabase_client.table("tickets").select("*").eq(
                "first_message_ts", thread_ts
            ).eq(
                "channel_id", channel_id
            ).eq(
                "status", "open"
            ).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error finding ticket by thread: {e}", exc_info=True)
            return None
    
    async def find_similar(
        self,
        embedding: List[float],
        channel_id: str,
        time_window_minutes: int = 30,
        similarity_threshold: float = 0.82,
        max_results: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find similar tickets using vector similarity
        
        Args:
            embedding: Message embedding vector
            channel_id: Slack channel ID
            time_window_minutes: How far back to search
            similarity_threshold: Minimum similarity score
            max_results: Maximum number of results
            
        Returns:
            List of similar ticket dicts
        """
        try:
            result = supabase_client.rpc(
                'find_similar_tickets',
                {
                    'query_embedding': embedding,
                    'similarity_threshold': similarity_threshold,
                    'time_window_minutes': time_window_minutes,
                    'channel_filter': channel_id,
                    'max_results': max_results
                }
            ).execute()
            
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error finding similar tickets: {e}", exc_info=True)
            return []
    
    async def create(self, ticket_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create new ticket
        
        Args:
            ticket_data: Ticket data dict
            
        Returns:
            Created ticket dict
        """
        try:
            result = supabase_client.table("tickets").insert(ticket_data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error creating ticket: {e}", exc_info=True)
            raise
    
    async def update(self, ticket_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update ticket
        
        Args:
            ticket_id: Ticket UUID
            updates: Fields to update
            
        Returns:
            Updated ticket dict
        """
        try:
            result = supabase_client.table("tickets").update(updates).eq(
                "id", ticket_id
            ).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error updating ticket: {e}", exc_info=True)
            raise
    
    async def get_all(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get all tickets with messages (for dashboard)
        
        Args:
            limit: Maximum number of tickets to return
            
        Returns:
            List of ticket dicts with nested messages
        """
        try:
            result = supabase_client.table("tickets").select(
                "*, messages(*)"
            ).order("updated_at", desc=True).limit(limit).execute()
            
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error getting all tickets: {e}", exc_info=True)
            return []

