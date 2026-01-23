"""
Backtest Service Layer
======================
Service layer for backtest CRUD operations with Supabase.
"""

import logging
import re
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from core.data_models import (
    BacktestConfig,
    BacktestListItem,
    PartialCloseLevel,
    PartialClosesConfig,
    PositionSizingConfig,
    RiskManagementConfig,
    StopLossConfig,
    TakeProfitConfig,
    TrailingStopConfig,
)
from db.supabase_client import get_supabase_client, is_configured

logger = logging.getLogger(__name__)


def _backtest_to_db_row(backtest: BacktestConfig) -> dict:
    """Convert a BacktestConfig to a database row format."""
    return {
        "id": backtest.id,
        "name": backtest.name,
        "description": backtest.description,
        "strategy_id": backtest.strategy_id,
        "pair": backtest.pair,
        "timeframe": backtest.timeframe,
        "start_date": backtest.start_date.isoformat() if backtest.start_date else None,
        "end_date": backtest.end_date.isoformat() if backtest.end_date else None,
        "initial_balance": float(backtest.initial_balance),
        "currency": backtest.currency,
        "position_sizing": backtest.position_sizing.model_dump()
        if backtest.position_sizing
        else {},
        "risk_management": backtest.risk_management.model_dump()
        if backtest.risk_management
        else {},
        "status": backtest.status,
        "results": backtest.results,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


def _db_row_to_backtest(row: dict, strategy_name: Optional[str] = None) -> BacktestConfig:
    """
    Convert a database row to a BacktestConfig with proper deserialization.
    """
    try:
        # Deserialize position sizing
        pos_sizing_data = row.get("position_sizing", {}) or {}
        position_sizing = (
            PositionSizingConfig(**pos_sizing_data) if pos_sizing_data else PositionSizingConfig()
        )

        # Deserialize risk management
        risk_mgmt_data = row.get("risk_management", {}) or {}
        risk_management = _deserialize_risk_management(risk_mgmt_data)

        # Parse dates
        start_date = row.get("start_date")
        end_date = row.get("end_date")
        if isinstance(start_date, str):
            start_date = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        if isinstance(end_date, str):
            end_date = datetime.fromisoformat(end_date.replace("Z", "+00:00"))

        return BacktestConfig(
            id=row.get("id"),
            name=row.get("name"),
            description=row.get("description"),
            strategy_id=row.get("strategy_id"),
            strategy_name=strategy_name,
            pair=row.get("pair"),
            timeframe=row.get("timeframe"),
            start_date=start_date,
            end_date=end_date,
            initial_balance=float(row.get("initial_balance", 10000)),
            currency=row.get("currency", "USD"),
            position_sizing=position_sizing,
            risk_management=risk_management,
            status=row.get("status", "pending"),
            results=row.get("results"),
            created_at=row.get("created_at"),
            updated_at=row.get("updated_at"),
        )
    except Exception as e:
        logger.error(f"Failed to deserialize backtest from database row: {e}")
        raise ValueError(f"Malformed backtest data in database: {e}")


def _deserialize_risk_management(data: dict) -> RiskManagementConfig:
    """Deserialize risk management configuration from database."""
    try:
        # Stop loss
        sl_data = data.get("stop_loss", {}) or {}
        stop_loss = StopLossConfig(**sl_data) if sl_data else StopLossConfig()

        # Take profit
        tp_data = data.get("take_profit", {}) or {}
        take_profit = TakeProfitConfig(**tp_data) if tp_data else TakeProfitConfig()

        # Trailing stop
        ts_data = data.get("trailing_stop", {}) or {}
        trailing_stop = TrailingStopConfig(**ts_data) if ts_data else TrailingStopConfig()

        # Partial closes
        pc_data = data.get("partial_closes", {}) or {}
        levels_data = pc_data.get("levels", []) or []
        levels = [PartialCloseLevel(**level) for level in levels_data]
        partial_closes = PartialClosesConfig(enabled=pc_data.get("enabled", False), levels=levels)

        return RiskManagementConfig(
            stop_loss=stop_loss,
            take_profit=take_profit,
            trailing_stop=trailing_stop,
            partial_closes=partial_closes,
        )
    except Exception as e:
        logger.warning(f"Failed to deserialize risk management: {e}")
        return RiskManagementConfig()


def _db_row_to_list_item(row: dict, strategy_name: Optional[str] = None) -> BacktestListItem:
    """Convert a database row to a BacktestListItem."""
    # Parse dates
    start_date = row.get("start_date")
    end_date = row.get("end_date")
    if isinstance(start_date, str):
        start_date = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
    if isinstance(end_date, str):
        end_date = datetime.fromisoformat(end_date.replace("Z", "+00:00"))

    return BacktestListItem(
        id=row.get("id"),
        name=row.get("name"),
        description=row.get("description"),
        strategy_id=row.get("strategy_id"),
        strategy_name=strategy_name,
        pair=row.get("pair"),
        timeframe=row.get("timeframe"),
        start_date=start_date,
        end_date=end_date,
        initial_balance=float(row.get("initial_balance", 10000)),
        currency=row.get("currency", "USD"),
        status=row.get("status", "pending"),
        results=row.get("results"),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )


def save_backtest(backtest: BacktestConfig) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Save or update a backtest to Supabase.

    Args:
        backtest: The backtest configuration to save

    Returns:
        Tuple of (success, backtest_id, error_message)
    """
    if not is_configured():
        return False, None, "Supabase not configured"

    client = get_supabase_client()
    if client is None:
        return False, None, "Failed to get Supabase client"

    try:
        # Generate ID if not provided
        if not backtest.id:
            backtest.id = str(uuid.uuid4())
            is_new = True
        else:
            is_new = False

        # Prepare the database row
        db_row = _backtest_to_db_row(backtest)

        if is_new:
            db_row["created_at"] = datetime.now(timezone.utc).isoformat()

        # Upsert the backtest
        result = client.table("backtests").upsert(db_row).execute()

        if result.data:
            logger.info(f"Backtest saved successfully: {backtest.name} (ID: {backtest.id})")
            return True, backtest.id, None
        else:
            return False, None, "No data returned from database"

    except Exception as e:
        logger.error(f"Failed to save backtest: {e}")
        return False, None, str(e)


def get_backtest(backtest_id: str) -> Tuple[bool, Optional[BacktestConfig], Optional[str]]:
    """
    Get a backtest by ID.

    Args:
        backtest_id: The backtest ID to retrieve

    Returns:
        Tuple of (success, backtest, error_message)
    """
    if not is_configured():
        return False, None, "Supabase not configured"

    client = get_supabase_client()
    if client is None:
        return False, None, "Failed to get Supabase client"

    try:
        result = client.table("backtests").select("*").eq("id", backtest_id).execute()

        if result.data and len(result.data) > 0:
            row = result.data[0]

            # Fetch strategy name if strategy_id exists
            strategy_name = None
            if row.get("strategy_id"):
                strategy_result = (
                    client.table("strategies")
                    .select("name")
                    .eq("id", row.get("strategy_id"))
                    .execute()
                )
                if strategy_result.data and len(strategy_result.data) > 0:
                    strategy_name = strategy_result.data[0].get("name")

            backtest = _db_row_to_backtest(row, strategy_name)
            return True, backtest, None
        else:
            return False, None, f"Backtest not found: {backtest_id}"

    except Exception as e:
        logger.error(f"Failed to get backtest {backtest_id}: {e}")
        return False, None, str(e)


def list_backtests() -> Tuple[bool, List[BacktestListItem], Optional[str]]:
    """
    List all saved backtests with strategy names.

    Returns:
        Tuple of (success, backtests, error_message)
    """
    if not is_configured():
        return False, [], "Supabase not configured"

    client = get_supabase_client()
    if client is None:
        return False, [], "Failed to get Supabase client"

    try:
        # Fetch all backtests
        result = client.table("backtests").select("*").order("updated_at", desc=True).execute()

        if not result.data:
            return True, [], None

        # Get unique strategy IDs
        strategy_ids = list(
            set(row.get("strategy_id") for row in result.data if row.get("strategy_id"))
        )

        # Fetch strategy names in bulk
        strategy_names = {}
        if strategy_ids:
            strategies_result = (
                client.table("strategies").select("id, name").in_("id", strategy_ids).execute()
            )
            if strategies_result.data:
                strategy_names = {s["id"]: s["name"] for s in strategies_result.data}

        # Convert to list items
        backtests = [
            _db_row_to_list_item(row, strategy_names.get(row.get("strategy_id")))
            for row in result.data
        ]

        return True, backtests, None

    except Exception as e:
        logger.error(f"Failed to list backtests: {e}")
        return False, [], str(e)


def delete_backtest(backtest_id: str) -> Tuple[bool, Optional[str]]:
    """
    Delete a backtest by ID.

    Args:
        backtest_id: The backtest ID to delete

    Returns:
        Tuple of (success, error_message)
    """
    if not is_configured():
        return False, "Supabase not configured"

    client = get_supabase_client()
    if client is None:
        return False, "Failed to get Supabase client"

    try:
        result = client.table("backtests").delete().eq("id", backtest_id).execute()

        if result.data:
            logger.info(f"Backtest deleted successfully: {backtest_id}")
            return True, None
        else:
            return False, f"Backtest not found: {backtest_id}"

    except Exception as e:
        logger.error(f"Failed to delete backtest {backtest_id}: {e}")
        return False, str(e)


def _generate_copy_name(original_name: str, existing_names: List[str]) -> str:
    """
    Generate a copy name for a backtest.

    Args:
        original_name: The original backtest name
        existing_names: List of existing backtest names to avoid conflicts

    Returns:
        A unique copy name like "Name - Copy" or "Name - Copy (2)"
    """
    base_copy_name = f"{original_name} - Copy"

    # Check if the base copy name is available
    if base_copy_name not in existing_names:
        return base_copy_name

    # Find the next available number
    pattern = re.compile(rf"^{re.escape(original_name)} - Copy(?:\s*\((\d+)\))?$")
    max_num = 1

    for name in existing_names:
        match = pattern.match(name)
        if match:
            num = match.group(1)
            if num:
                max_num = max(max_num, int(num))
            else:
                max_num = max(max_num, 1)

    return f"{original_name} - Copy ({max_num + 1})"


def duplicate_backtest(
    backtest_id: str,
) -> Tuple[bool, Optional[str], Optional[str], Optional[str]]:
    """
    Duplicate a backtest by ID.

    Args:
        backtest_id: The backtest ID to duplicate

    Returns:
        Tuple of (success, new_backtest_id, new_backtest_name, error_message)
    """
    if not is_configured():
        return False, None, None, "Supabase not configured"

    client = get_supabase_client()
    if client is None:
        return False, None, None, "Failed to get Supabase client"

    try:
        # Fetch the original backtest
        success, original_backtest, error = get_backtest(backtest_id)
        if not success or original_backtest is None:
            return False, None, None, error or f"Backtest not found: {backtest_id}"

        # Get all existing backtest names to avoid conflicts
        result = client.table("backtests").select("name").execute()
        existing_names = [row.get("name") for row in result.data] if result.data else []

        # Generate a unique copy name
        new_name = _generate_copy_name(original_backtest.name, existing_names)

        # Truncate if name exceeds max length (100 chars)
        if len(new_name) > 100:
            base_name = original_backtest.name[:80]
            new_name = _generate_copy_name(base_name, existing_names)
            if len(new_name) > 100:
                new_name = new_name[:100]

        # Create the duplicate with new ID and name
        duplicate = BacktestConfig(
            id=None,  # Will be generated on save
            name=new_name,
            description=original_backtest.description,
            strategy_id=original_backtest.strategy_id,
            strategy_name=original_backtest.strategy_name,
            pair=original_backtest.pair,
            timeframe=original_backtest.timeframe,
            start_date=original_backtest.start_date,
            end_date=original_backtest.end_date,
            initial_balance=original_backtest.initial_balance,
            currency=original_backtest.currency,
            position_sizing=original_backtest.position_sizing,
            risk_management=original_backtest.risk_management,
            status="pending",  # Reset status for duplicate
            results=None,  # Clear results for duplicate
            created_at=None,
            updated_at=None,
        )

        # Save the duplicate
        success, new_id, error = save_backtest(duplicate)
        if not success:
            return False, None, None, error or "Failed to save duplicate"

        logger.info(f"Backtest duplicated: {original_backtest.name} -> {new_name} (ID: {new_id})")
        return True, new_id, new_name, None

    except Exception as e:
        logger.error(f"Failed to duplicate backtest {backtest_id}: {e}")
        return False, None, None, str(e)
