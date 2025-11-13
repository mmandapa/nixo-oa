"""
Configuration management for FDE Slackbot
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Slack Configuration
    SLACK_BOT_TOKEN: str
    SLACK_APP_TOKEN: str
    SLACK_SIGNING_SECRET: Optional[str] = None
    FDE_SLACK_USER_ID: str  # Your Slack user ID to filter out your own messages
    
    # OpenAI Configuration
    OPENAI_API_KEY: str
    
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_KEY: str  # Service role key
    
    # Application Settings
    LOG_LEVEL: str = "INFO"
    SIMILARITY_THRESHOLD: float = 0.75  # Lowered from 0.82 for better grouping
    TIME_WINDOW_MINUTES: int = 60  # Increased from 30 to 60 minutes
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

