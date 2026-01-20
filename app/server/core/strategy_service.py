"""
Strategy Service Layer
======================
Service layer for strategy CRUD operations with Supabase.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from core.data_models import (
    CheckNameResponse,
    StrategyConfig,
    StrategyListItem,
)
from db.supabase_client import get_supabase_client, is_configured

logger = logging.getLogger(__name__)


def _strategy_to_db_row(strategy: StrategyConfig) -> dict:
    """Convert a StrategyConfig to a database row format."""
    return {
        "id": strategy.id,
        "name": strategy.name,
        "description": strategy.description,
        "tags": strategy.tags or [],
        "trade_direction": strategy.trade_direction,
        "confirm_on_candle_close": strategy.confirm_on_candle_close,
        "pair": strategy.pair,
        "timeframe": strategy.timeframe,
        "candle_count": strategy.candle_count,
        "indicators": [ind.model_dump() for ind in strategy.indicators] if strategy.indicators else [],
        "patterns": [pat.model_dump() for pat in strategy.patterns] if strategy.patterns else [],
        "conditions": [cond.model_dump() for cond in strategy.conditions] if strategy.conditions else [],
        "groups": [grp.model_dump() for grp in strategy.groups] if strategy.groups else [],
        "reference_indicators": [ri.model_dump() for ri in strategy.reference_indicators] if strategy.reference_indicators else [],
        "time_filter": strategy.time_filter.model_dump() if strategy.time_filter else None,
        "drawings": strategy.drawings or [],
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


def _db_row_to_strategy(row: dict) -> StrategyConfig:
    """Convert a database row to a StrategyConfig."""
    return StrategyConfig(
        id=row.get("id"),
        name=row.get("name"),
        description=row.get("description"),
        tags=row.get("tags", []),
        trade_direction=row.get("trade_direction", "both"),
        confirm_on_candle_close=row.get("confirm_on_candle_close", "yes"),
        pair=row.get("pair"),
        timeframe=row.get("timeframe"),
        candle_count=row.get("candle_count"),
        indicators=row.get("indicators", []),
        patterns=row.get("patterns", []),
        conditions=row.get("conditions", []),
        groups=row.get("groups", []),
        reference_indicators=row.get("reference_indicators", []),
        time_filter=row.get("time_filter"),
        drawings=row.get("drawings", []),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )


def _db_row_to_list_item(row: dict) -> StrategyListItem:
    """Convert a database row to a StrategyListItem."""
    return StrategyListItem(
        id=row.get("id"),
        name=row.get("name"),
        description=row.get("description"),
        tags=row.get("tags", []),
        trade_direction=row.get("trade_direction", "both"),
        pair=row.get("pair"),
        timeframe=row.get("timeframe"),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )


def save_strategy(strategy: StrategyConfig) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Save or update a strategy to Supabase.

    Args:
        strategy: The strategy configuration to save

    Returns:
        Tuple of (success, strategy_id, error_message)
    """
    if not is_configured():
        return False, None, "Supabase not configured"

    client = get_supabase_client()
    if client is None:
        return False, None, "Failed to get Supabase client"

    try:
        # Generate ID if not provided
        if not strategy.id:
            strategy.id = str(uuid.uuid4())
            is_new = True
        else:
            is_new = False

        # Prepare the database row
        db_row = _strategy_to_db_row(strategy)

        if is_new:
            db_row["created_at"] = datetime.now(timezone.utc).isoformat()

        # Upsert the strategy
        result = client.table("strategies").upsert(db_row).execute()

        if result.data:
            logger.info(f"Strategy saved successfully: {strategy.name} (ID: {strategy.id})")
            return True, strategy.id, None
        else:
            return False, None, "No data returned from database"

    except Exception as e:
        logger.error(f"Failed to save strategy: {e}")
        return False, None, str(e)


def get_strategy(strategy_id: str) -> Tuple[bool, Optional[StrategyConfig], Optional[str]]:
    """
    Get a strategy by ID.

    Args:
        strategy_id: The strategy ID to retrieve

    Returns:
        Tuple of (success, strategy, error_message)
    """
    if not is_configured():
        return False, None, "Supabase not configured"

    client = get_supabase_client()
    if client is None:
        return False, None, "Failed to get Supabase client"

    try:
        result = client.table("strategies").select("*").eq("id", strategy_id).execute()

        if result.data and len(result.data) > 0:
            strategy = _db_row_to_strategy(result.data[0])
            return True, strategy, None
        else:
            return False, None, f"Strategy not found: {strategy_id}"

    except Exception as e:
        logger.error(f"Failed to get strategy {strategy_id}: {e}")
        return False, None, str(e)


def list_strategies() -> Tuple[bool, List[StrategyListItem], Optional[str]]:
    """
    List all saved strategies.

    Returns:
        Tuple of (success, strategies, error_message)
    """
    if not is_configured():
        return False, [], "Supabase not configured"

    client = get_supabase_client()
    if client is None:
        return False, [], "Failed to get Supabase client"

    try:
        result = (
            client.table("strategies")
            .select("id, name, description, tags, trade_direction, pair, timeframe, created_at, updated_at")
            .order("updated_at", desc=True)
            .execute()
        )

        strategies = [_db_row_to_list_item(row) for row in result.data] if result.data else []
        return True, strategies, None

    except Exception as e:
        logger.error(f"Failed to list strategies: {e}")
        return False, [], str(e)


def delete_strategy(strategy_id: str) -> Tuple[bool, Optional[str]]:
    """
    Delete a strategy by ID.

    Args:
        strategy_id: The strategy ID to delete

    Returns:
        Tuple of (success, error_message)
    """
    if not is_configured():
        return False, "Supabase not configured"

    client = get_supabase_client()
    if client is None:
        return False, "Failed to get Supabase client"

    try:
        result = client.table("strategies").delete().eq("id", strategy_id).execute()

        if result.data:
            logger.info(f"Strategy deleted successfully: {strategy_id}")
            return True, None
        else:
            return False, f"Strategy not found: {strategy_id}"

    except Exception as e:
        logger.error(f"Failed to delete strategy {strategy_id}: {e}")
        return False, str(e)


def check_name_exists(name: str) -> Tuple[bool, CheckNameResponse, Optional[str]]:
    """
    Check if a strategy with the given name already exists.

    Args:
        name: The strategy name to check

    Returns:
        Tuple of (success, response, error_message)
    """
    if not is_configured():
        return False, CheckNameResponse(exists=False), "Supabase not configured"

    client = get_supabase_client()
    if client is None:
        return False, CheckNameResponse(exists=False), "Failed to get Supabase client"

    try:
        result = (
            client.table("strategies")
            .select("id")
            .eq("name", name)
            .execute()
        )

        if result.data and len(result.data) > 0:
            return True, CheckNameResponse(exists=True, strategy_id=result.data[0].get("id")), None
        else:
            return True, CheckNameResponse(exists=False), None

    except Exception as e:
        logger.error(f"Failed to check strategy name '{name}': {e}")
        return False, CheckNameResponse(exists=False), str(e)
