"""
FDE Slackbot - Main Entry Point
"""
import logging
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.slack.event_handler import SlackEventHandler
from backend.config import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


async def main():
    """Main application entry point"""
    logger.info("Starting FDE Slackbot...")
    logger.info(f"FDE User ID: {settings.FDE_SLACK_USER_ID}")
    
    # Initialize and start Slack event handler
    handler = SlackEventHandler()
    await handler.start()


if __name__ == "__main__":
    import asyncio
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)

