"""
Slack utility functions
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class SlackUtils:
    """Utility functions for Slack API calls"""
    
    async def get_user_name(self, user_id: str, slack_client) -> Optional[str]:
        """
        Get user display name from Slack
        
        Args:
            user_id: Slack user ID
            slack_client: Slack async WebClient instance
            
        Returns:
            User display name or None
        """
        try:
            response = await slack_client.users_info(user=user_id)
            if response and response.get("user"):
                return response["user"].get("real_name") or response["user"].get("name")
            return None
        except Exception as e:
            logger.warning(f"Error fetching user name for {user_id}: {e}")
            return None
    
    async def get_channel_name(self, channel_id: str, slack_client) -> Optional[str]:
        """
        Get channel name from Slack
        
        Args:
            channel_id: Slack channel ID
            slack_client: Slack async WebClient instance
            
        Returns:
            Channel name (with # prefix) or None
        """
        try:
            response = await slack_client.conversations_info(channel=channel_id)
            if response and response.get("channel"):
                channel_name = response["channel"].get("name")
                return f"#{channel_name}" if channel_name else None
            return None
        except Exception as e:
            logger.warning(f"Error fetching channel name for {channel_id}: {e}")
            return None

