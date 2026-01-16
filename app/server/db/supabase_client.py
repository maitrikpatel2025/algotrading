"""
Supabase Client Module
======================
Supabase client initialization and connection validation.
"""

import logging
from typing import Optional

from supabase import Client, create_client

from config.settings import SUPABASE_ANON_KEY, SUPABASE_URL

logger = logging.getLogger(__name__)

# Global client instance
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """
    Get or create the Supabase client instance.

    Returns:
        Supabase client or None if not configured
    """
    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        logger.warning(
            "Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY "
            "environment variables to enable database features."
        )
        return None

    try:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        logger.info("Supabase client initialized successfully")
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None


def validate_connection() -> bool:
    """
    Validate the Supabase connection on startup.

    Returns:
        True if connection is valid, False otherwise
    """
    if not SUPABASE_URL:
        logger.warning(
            "SUPABASE_URL environment variable is not set. "
            "Please configure your Supabase credentials in .env file."
        )
        return False

    if not SUPABASE_ANON_KEY:
        logger.warning(
            "SUPABASE_ANON_KEY environment variable is not set. "
            "Please configure your Supabase credentials in .env file."
        )
        return False

    client = get_supabase_client()
    if client is None:
        return False

    try:
        # Test connection by making a simple query
        # This will fail gracefully if tables don't exist yet
        client.table("forex_instruments").select("*").limit(1).execute()
        logger.info("Supabase connection validated successfully")
        return True
    except Exception as e:
        # Connection might be valid but table doesn't exist yet
        # Check if it's a "relation does not exist" error (table not created)
        error_msg = str(e).lower()
        if "does not exist" in error_msg or "relation" in error_msg:
            logger.info(
                "Supabase connection valid. Tables may need to be created. "
                "Run migrations to create required tables."
            )
            return True
        logger.error(f"Supabase connection validation failed: {e}")
        return False


def is_configured() -> bool:
    """
    Check if Supabase is configured.

    Returns:
        True if Supabase URL and key are set, False otherwise
    """
    return bool(SUPABASE_URL and SUPABASE_ANON_KEY)
