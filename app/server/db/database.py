"""
Database Module
===============
Supabase database connection and operations.
"""

import logging
from typing import Dict, List, Optional

from db.supabase_client import get_supabase_client, is_configured

logger = logging.getLogger(__name__)


class DataDB:
    """
    Supabase database wrapper for forex data operations.
    """

    # Table names
    SAMPLE_COLL = "forex_sample"
    CALENDAR_COLL = "forex_calendar"
    INSTRUMENTS_COLL = "forex_instruments"

    def __init__(self):
        """Initialize Supabase connection."""
        self.client = get_supabase_client()
        if self.client is None and is_configured():
            logger.warning("Supabase client initialization failed")

    def test_connection(self) -> None:
        """Test database connection by querying tables."""
        if self.client is None:
            logger.debug("Supabase not configured")
            return
        try:
            # Test by selecting from instruments table
            self.client.table(self.INSTRUMENTS_COLL).select("*").limit(1).execute()
            logger.debug("Supabase connection test successful")
        except Exception as e:
            logger.debug(f"Supabase connection test: {e}")

    def delete_many(self, collection: str, **kwargs) -> None:
        """
        Delete multiple rows from a table.

        Args:
            collection: Table name
            **kwargs: Query parameters for matching rows
        """
        if self.client is None:
            logger.warning("Supabase not configured, skipping delete_many")
            return
        try:
            query = self.client.table(collection).delete()
            if kwargs:
                query = query.match(kwargs)
            else:
                # Delete all rows - need at least one condition for Supabase
                # Use a condition that matches all rows
                query = query.neq("id", -1)
            query.execute()
        except Exception as error:
            logger.error(f"delete_many error: {error}")

    def add_one(self, collection: str, document: Dict) -> None:
        """
        Add a single row to a table.

        Args:
            collection: Table name
            document: Row data to insert
        """
        if self.client is None:
            logger.warning("Supabase not configured, skipping add_one")
            return
        try:
            self.client.table(collection).insert(document).execute()
        except Exception as error:
            logger.error(f"add_one error: {error}")

    def add_many(self, collection: str, documents: List[Dict]) -> None:
        """
        Add multiple rows to a table.

        Args:
            collection: Table name
            documents: List of row data to insert
        """
        if self.client is None:
            logger.warning("Supabase not configured, skipping add_many")
            return
        try:
            self.client.table(collection).insert(documents).execute()
        except Exception as error:
            logger.error(f"add_many error: {error}")

    def query_distinct(self, collection: str, key: str) -> Optional[List]:
        """
        Get distinct values for a column in a table.

        Args:
            collection: Table name
            key: Column name to get distinct values for

        Returns:
            List of distinct values or None on error
        """
        if self.client is None:
            logger.warning("Supabase not configured, returning None for query_distinct")
            return None
        try:
            result = self.client.table(collection).select(key).execute()
            # Extract distinct values using a set
            values = set()
            for row in result.data:
                if key in row:
                    values.add(row[key])
            return list(values)
        except Exception as error:
            logger.error(f"query_distinct error: {error}")
            return None

    def query_single(self, collection: str, **kwargs) -> Optional[Dict]:
        """
        Query a single row from a table.

        Args:
            collection: Table name
            **kwargs: Query parameters

        Returns:
            Row data (without internal id) or None if not found
        """
        if self.client is None:
            logger.warning("Supabase not configured, returning None for query_single")
            return None
        try:
            query = self.client.table(collection).select("*")
            if kwargs:
                query = query.match(kwargs)
            result = query.limit(1).execute()

            if result.data and len(result.data) > 0:
                row = result.data[0]
                # Remove internal Supabase fields from response
                row.pop("id", None)
                row.pop("created_at", None)
                row.pop("updated_at", None)
                return row
            return None
        except Exception as error:
            logger.error(f"query_single error: {error}")
            return None

    def query_all(self, collection: str, **kwargs) -> Optional[List[Dict]]:
        """
        Query all matching rows from a table.

        Args:
            collection: Table name
            **kwargs: Query parameters

        Returns:
            List of row data (without internal ids) or None on error
        """
        if self.client is None:
            logger.warning("Supabase not configured, returning None for query_all")
            return None
        try:
            query = self.client.table(collection).select("*")
            if kwargs:
                query = query.match(kwargs)
            result = query.execute()

            data = []
            for row in result.data:
                # Remove internal Supabase fields from response
                row.pop("id", None)
                row.pop("created_at", None)
                row.pop("updated_at", None)
                data.append(row)
            return data
        except Exception as error:
            logger.error(f"query_all error: {error}")
            return None
