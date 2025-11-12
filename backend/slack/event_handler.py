"""
Slack event handler using Socket Mode
"""
import logging
from slack_bolt.async_app import AsyncApp
from slack_bolt.adapter.socket_mode.async_handler import AsyncSocketModeHandler

from backend.config import settings
from backend.processing.message_processor import MessageProcessor

logger = logging.getLogger(__name__)


class SlackEventHandler:
    """Handles Slack events via Socket Mode"""
    
    def __init__(self):
        self.app = AsyncApp(token=settings.SLACK_BOT_TOKEN)
        self.processor = MessageProcessor()
        self.fde_user_id = settings.FDE_SLACK_USER_ID
        self._setup_handlers()
    
    def _setup_handlers(self):
        """Register Slack event handlers"""
        
        @self.app.event("message")
        async def handle_message(event, say, client):
            """
            Handle message events from Slack
            
            Filters out:
            - Bot messages
            - FDE's own messages
            - Messages without text
            """
            # Skip bot messages
            if event.get("bot_id"):
                return
            
            # Skip FDE's own messages
            user_id = event.get("user")
            if user_id == self.fde_user_id:
                logger.debug(f"Skipping FDE message from {user_id}")
                return
            
            # Skip if no text
            if not event.get("text"):
                return
            
            # Skip if message is a subtype (e.g., channel_join, etc.)
            if event.get("subtype"):
                return
            
            logger.info(f"Received message event: {event.get('text', '')[:50]}")
            
            # Process message asynchronously (don't block Slack response)
            try:
                await self.processor.process_message(event, client)
            except Exception as e:
                logger.error(f"Error processing message: {e}", exc_info=True)
        
        @self.app.event("app_mention")
        async def handle_mention(event, say, client):
            """Handle app mentions (optional - can process these too)"""
            # Similar to message handler
            await handle_message(event, say, client)
    
    async def start(self):
        """Start the Socket Mode handler"""
        handler = AsyncSocketModeHandler(
            self.app,
            settings.SLACK_APP_TOKEN
        )
        logger.info("Starting Slack Socket Mode handler...")
        await handler.start_async()

