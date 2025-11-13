"""
Ticket history database operations
"""
import logging
from typing import List, Dict, Any
from backend.database.client import supabase_client

logger = logging.getLogger(__name__)


class HistoryRepository:
    """Repository for ticket history operations"""
    
    async def get_by_ticket(self, ticket_id: str) -> List[Dict[str, Any]]:
        """
        Get all history entries for a ticket
        
        Args:
            ticket_id: Ticket UUID
            
        Returns:
            List of history entries, ordered by created_at DESC
        """
        try:
            result = supabase_client.table("ticket_history").select("*").eq(
                "ticket_id", ticket_id
            ).order("created_at", desc=True).execute()
            
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error getting ticket history: {e}", exc_info=True)
            return []
    
    async def create(
        self,
        ticket_id: str,
        action: str,
        old_value: str = None,
        new_value: str = None,
        changed_by: str = None,
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Create a history entry
        
        Args:
            ticket_id: Ticket UUID
            action: Action type (created, status_changed, title_updated, etc.)
            old_value: Previous value
            new_value: New value
            changed_by: User who made the change
            metadata: Additional context
            
        Returns:
            Created history entry
        """
        try:
            history_data = {
                "ticket_id": ticket_id,
                "action": action,
                "old_value": old_value,
                "new_value": new_value,
                "changed_by": changed_by,
                "metadata": metadata
            }
            
            result = supabase_client.table("ticket_history").insert(history_data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error creating history entry: {e}", exc_info=True)
            raise

