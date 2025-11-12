"""
Supabase client initialization
"""
from supabase import create_client, Client
from backend.config import settings

# Global Supabase client
supabase_client: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY
)

