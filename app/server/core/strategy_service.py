"""
Strategy Service Layer
======================
Service layer for strategy CRUD operations with Supabase.
"""

import logging
import re
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from core.data_models import (
    CheckNameResponse,
    ImportValidationResult,
    StrategyConfig,
    StrategyExport,
    StrategyListItem,
    StrategyListItemExtended,
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
        "indicators": [ind.model_dump() for ind in strategy.indicators]
        if strategy.indicators
        else [],
        "patterns": [pat.model_dump() for pat in strategy.patterns] if strategy.patterns else [],
        "conditions": [cond.model_dump() for cond in strategy.conditions]
        if strategy.conditions
        else [],
        "groups": [grp.model_dump() for grp in strategy.groups] if strategy.groups else [],
        "reference_indicators": [ri.model_dump() for ri in strategy.reference_indicators]
        if strategy.reference_indicators
        else [],
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
            .select(
                "id, name, description, tags, trade_direction, pair, timeframe, created_at, updated_at"
            )
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
        result = client.table("strategies").select("id").eq("name", name).execute()

        if result.data and len(result.data) > 0:
            return True, CheckNameResponse(exists=True, strategy_id=result.data[0].get("id")), None
        else:
            return True, CheckNameResponse(exists=False), None

    except Exception as e:
        logger.error(f"Failed to check strategy name '{name}': {e}")
        return False, CheckNameResponse(exists=False), str(e)


def _db_row_to_extended_list_item(row: dict) -> StrategyListItemExtended:
    """Convert a database row to a StrategyListItemExtended."""
    indicators = row.get("indicators", []) or []
    conditions = row.get("conditions", []) or []
    drawings = row.get("drawings", []) or []
    patterns = row.get("patterns", []) or []

    return StrategyListItemExtended(
        id=row.get("id"),
        name=row.get("name"),
        description=row.get("description"),
        tags=row.get("tags", []),
        trade_direction=row.get("trade_direction", "both"),
        pair=row.get("pair"),
        timeframe=row.get("timeframe"),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
        indicator_count=len(indicators),
        condition_count=len(conditions),
        drawing_count=len(drawings),
        pattern_count=len(patterns),
    )


def list_strategies_extended() -> Tuple[bool, List[StrategyListItemExtended], Optional[str]]:
    """
    List all saved strategies with extended metadata.

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
            .select(
                "id, name, description, tags, trade_direction, pair, timeframe, created_at, updated_at, indicators, conditions, drawings, patterns"
            )
            .order("updated_at", desc=True)
            .execute()
        )

        strategies = (
            [_db_row_to_extended_list_item(row) for row in result.data] if result.data else []
        )
        return True, strategies, None

    except Exception as e:
        logger.error(f"Failed to list strategies (extended): {e}")
        return False, [], str(e)


def _generate_copy_name(original_name: str, existing_names: List[str]) -> str:
    """
    Generate a copy name for a strategy.

    Args:
        original_name: The original strategy name
        existing_names: List of existing strategy names to avoid conflicts

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


def duplicate_strategy(
    strategy_id: str,
) -> Tuple[bool, Optional[str], Optional[str], Optional[str]]:
    """
    Duplicate a strategy by ID.

    Args:
        strategy_id: The strategy ID to duplicate

    Returns:
        Tuple of (success, new_strategy_id, new_strategy_name, error_message)
    """
    if not is_configured():
        return False, None, None, "Supabase not configured"

    client = get_supabase_client()
    if client is None:
        return False, None, None, "Failed to get Supabase client"

    try:
        # Fetch the original strategy
        success, original_strategy, error = get_strategy(strategy_id)
        if not success or original_strategy is None:
            return False, None, None, error or f"Strategy not found: {strategy_id}"

        # Get all existing strategy names to avoid conflicts
        result = client.table("strategies").select("name").execute()
        existing_names = [row.get("name") for row in result.data] if result.data else []

        # Generate a unique copy name
        new_name = _generate_copy_name(original_strategy.name, existing_names)

        # Truncate if name exceeds max length (50 chars)
        if len(new_name) > 50:
            # Try to fit within limit
            base_name = original_strategy.name[:30]
            new_name = _generate_copy_name(base_name, existing_names)
            if len(new_name) > 50:
                new_name = new_name[:50]

        # Create the duplicate with new ID and name
        duplicate = StrategyConfig(
            id=None,  # Will be generated on save
            name=new_name,
            description=original_strategy.description,
            tags=original_strategy.tags.copy() if original_strategy.tags else [],
            trade_direction=original_strategy.trade_direction,
            confirm_on_candle_close=original_strategy.confirm_on_candle_close,
            pair=original_strategy.pair,
            timeframe=original_strategy.timeframe,
            candle_count=original_strategy.candle_count,
            indicators=original_strategy.indicators,
            patterns=original_strategy.patterns,
            conditions=original_strategy.conditions,
            groups=original_strategy.groups,
            reference_indicators=original_strategy.reference_indicators,
            time_filter=original_strategy.time_filter,
            drawings=original_strategy.drawings,
            created_at=None,  # Will be set on save
            updated_at=None,  # Will be set on save
        )

        # Save the duplicate
        success, new_id, error = save_strategy(duplicate)
        if not success:
            return False, None, None, error or "Failed to save duplicate"

        logger.info(f"Strategy duplicated: {original_strategy.name} -> {new_name} (ID: {new_id})")
        return True, new_id, new_name, None

    except Exception as e:
        logger.error(f"Failed to duplicate strategy {strategy_id}: {e}")
        return False, None, None, str(e)


def get_strategy_for_export(
    strategy_id: str,
) -> Tuple[bool, Optional[StrategyExport], Optional[str]]:
    """
    Get a strategy wrapped in export schema.

    Args:
        strategy_id: The strategy ID to export

    Returns:
        Tuple of (success, export_data, error_message)
    """
    if not is_configured():
        return False, None, "Supabase not configured"

    try:
        # Fetch the strategy
        success, strategy, error = get_strategy(strategy_id)
        if not success or strategy is None:
            return False, None, error or f"Strategy not found: {strategy_id}"

        # Create a clean copy for export (remove internal IDs)
        export_strategy = StrategyConfig(
            id=None,  # Don't include internal ID in export
            name=strategy.name,
            description=strategy.description,
            tags=strategy.tags.copy() if strategy.tags else [],
            trade_direction=strategy.trade_direction,
            confirm_on_candle_close=strategy.confirm_on_candle_close,
            pair=strategy.pair,
            timeframe=strategy.timeframe,
            candle_count=strategy.candle_count,
            indicators=strategy.indicators,
            patterns=strategy.patterns,
            conditions=strategy.conditions,
            groups=strategy.groups,
            reference_indicators=strategy.reference_indicators,
            time_filter=strategy.time_filter,
            drawings=strategy.drawings,
            created_at=None,  # Don't include timestamps in export
            updated_at=None,
        )

        # Wrap in export schema
        export_data = StrategyExport(
            schema_version="1.0",
            export_date=datetime.now(timezone.utc),
            strategy=export_strategy,
        )

        logger.info(f"Strategy prepared for export: {strategy.name}")
        return True, export_data, None

    except Exception as e:
        logger.error(f"Failed to prepare strategy {strategy_id} for export: {e}")
        return False, None, str(e)


SUPPORTED_SCHEMA_VERSIONS = ["1.0"]
REQUIRED_STRATEGY_FIELDS = ["name"]


def validate_import(import_data: dict) -> ImportValidationResult:
    """
    Validate import data structure and content.

    Args:
        import_data: The raw import JSON data

    Returns:
        ImportValidationResult with validation status and details
    """
    errors = []
    warnings = []
    strategy_preview = None
    name_conflict = False
    conflicting_strategy_id = None

    # Check schema version
    schema_version = import_data.get("schema_version") or import_data.get("schemaVersion")
    if not schema_version:
        # Legacy format without version - treat as 1.0
        warnings.append("No schema version found. Assuming version 1.0.")
        schema_version = "1.0"
    elif schema_version not in SUPPORTED_SCHEMA_VERSIONS:
        errors.append(
            f"Unsupported schema version: {schema_version}. Supported versions: {', '.join(SUPPORTED_SCHEMA_VERSIONS)}"
        )

    # Get strategy data - support both formats
    strategy_data = import_data.get("strategy")
    if not strategy_data:
        # Maybe the import is just the strategy itself (without wrapper)
        if "name" in import_data and "trade_direction" in import_data:
            strategy_data = import_data
            warnings.append("Import appears to be raw strategy data without export wrapper.")
        else:
            errors.append("Missing 'strategy' field in import data.")

    if strategy_data:
        # Validate required fields
        for field in REQUIRED_STRATEGY_FIELDS:
            if not strategy_data.get(field):
                errors.append(f"Missing required field: {field}")

        # Validate name length
        name = strategy_data.get("name", "")
        if len(name) > 50:
            errors.append(
                f"Strategy name exceeds maximum length of 50 characters (got {len(name)})"
            )

        # Validate trade direction
        trade_direction = strategy_data.get("trade_direction", "both")
        if trade_direction not in ["long", "short", "both"]:
            errors.append(
                f"Invalid trade_direction: {trade_direction}. Must be 'long', 'short', or 'both'."
            )

        # Check for name conflicts
        if name and is_configured():
            success, check_result, _ = check_name_exists(name)
            if success and check_result.exists:
                name_conflict = True
                conflicting_strategy_id = check_result.strategy_id
                warnings.append(f"A strategy with name '{name}' already exists.")

        # Create preview
        if not errors:
            strategy_preview = {
                "name": strategy_data.get("name"),
                "description": strategy_data.get("description"),
                "tags": strategy_data.get("tags", []),
                "trade_direction": strategy_data.get("trade_direction", "both"),
                "pair": strategy_data.get("pair"),
                "timeframe": strategy_data.get("timeframe"),
                "indicator_count": len(strategy_data.get("indicators", [])),
                "condition_count": len(strategy_data.get("conditions", [])),
                "drawing_count": len(strategy_data.get("drawings", [])),
                "pattern_count": len(strategy_data.get("patterns", [])),
            }

    return ImportValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        warnings=warnings,
        strategy_preview=strategy_preview,
        name_conflict=name_conflict,
        conflicting_strategy_id=conflicting_strategy_id,
    )


def import_strategy(
    import_data: dict,
    name_override: Optional[str] = None,
    conflict_resolution: Optional[str] = None,
) -> Tuple[bool, Optional[str], Optional[str], Optional[str]]:
    """
    Import a strategy from validated import data.

    Args:
        import_data: The validated import JSON data
        name_override: Optional name to use instead of original
        conflict_resolution: How to handle name conflicts ('rename', 'replace', 'keep_both')

    Returns:
        Tuple of (success, strategy_id, strategy_name, error_message)
    """
    if not is_configured():
        return False, None, None, "Supabase not configured"

    try:
        # Get strategy data from import
        strategy_data = import_data.get("strategy") or import_data

        # Determine final name
        original_name = strategy_data.get("name", "Imported Strategy")
        final_name = name_override or original_name

        # Handle name conflicts
        if conflict_resolution:
            success, check_result, _ = check_name_exists(final_name)
            if success and check_result.exists:
                if conflict_resolution == "replace":
                    # Delete existing strategy
                    delete_strategy(check_result.strategy_id)
                elif conflict_resolution == "keep_both":
                    # Generate a unique name
                    client = get_supabase_client()
                    result = client.table("strategies").select("name").execute()
                    existing_names = [row.get("name") for row in result.data] if result.data else []

                    # Generate unique name with number suffix
                    base_name = final_name
                    counter = 2
                    while final_name in existing_names:
                        final_name = f"{base_name} ({counter})"
                        counter += 1
                        if len(final_name) > 50:
                            final_name = f"{base_name[:45]} ({counter})"
                elif conflict_resolution == "rename":
                    # Name should already be changed via name_override
                    pass

        # Create strategy config from import data
        strategy = StrategyConfig(
            id=None,  # Generate new ID
            name=final_name,
            description=strategy_data.get("description"),
            tags=strategy_data.get("tags", []),
            trade_direction=strategy_data.get("trade_direction", "both"),
            confirm_on_candle_close=strategy_data.get("confirm_on_candle_close", "yes"),
            pair=strategy_data.get("pair"),
            timeframe=strategy_data.get("timeframe"),
            candle_count=strategy_data.get("candle_count"),
            indicators=strategy_data.get("indicators", []),
            patterns=strategy_data.get("patterns", []),
            conditions=strategy_data.get("conditions", []),
            groups=strategy_data.get("groups", []),
            reference_indicators=strategy_data.get("reference_indicators", []),
            time_filter=strategy_data.get("time_filter"),
            drawings=strategy_data.get("drawings", []),
        )

        # Save the imported strategy
        success, strategy_id, error = save_strategy(strategy)
        if not success:
            return False, None, None, error or "Failed to save imported strategy"

        logger.info(f"Strategy imported: {final_name} (ID: {strategy_id})")
        return True, strategy_id, final_name, None

    except Exception as e:
        logger.error(f"Failed to import strategy: {e}")
        return False, None, None, str(e)
