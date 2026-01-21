"""
Pydantic Data Models
====================
Request and response models for the Forex Trading API.
"""

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field

# =============================================================================
# Health Check Models
# =============================================================================

class HealthCheckResponse(BaseModel):
    """Health check response model."""
    status: Literal["ok", "error"]
    service: str = "forex-trading-api"
    version: str = "1.0.0"
    uptime_seconds: Optional[float] = None
    database_connected: Optional[bool] = None


# =============================================================================
# Account Models
# =============================================================================

class AccountSummaryResponse(BaseModel):
    """Trading account summary response."""
    balance: Optional[float] = None
    margin_used: Optional[float] = None
    margin_available: Optional[float] = None
    unrealized_pl: Optional[float] = None
    currency: Optional[str] = None
    raw_data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


# =============================================================================
# Headlines Models
# =============================================================================

class HeadlineItem(BaseModel):
    """Single headline item."""
    headline: str
    link: str


class HeadlinesResponse(BaseModel):
    """Market headlines response."""
    headlines: List[HeadlineItem] = []
    count: int = 0
    error: Optional[str] = None


# =============================================================================
# Trading Options Models
# =============================================================================

class OptionItem(BaseModel):
    """Single option item for dropdowns."""
    key: str
    text: str
    value: str
    category: Optional[str] = None


class TradingOptionsResponse(BaseModel):
    """Available trading options response."""
    pairs: List[OptionItem] = []
    granularities: List[OptionItem] = []
    error: Optional[str] = None


# =============================================================================
# Technical Analysis Models
# =============================================================================

class TechnicalIndicator(BaseModel):
    """Technical indicator data."""
    name: str
    value: Any
    signal: Optional[str] = None


class TechnicalsResponse(BaseModel):
    """Technical analysis response."""
    pair_name: Optional[str] = None
    time_frame: Optional[int] = None
    ti_buy: Optional[str] = None
    ti_sell: Optional[str] = None
    ma_buy: Optional[str] = None
    ma_sell: Optional[str] = None
    pivot: Optional[str] = None
    S1: Optional[str] = None
    S2: Optional[str] = None
    S3: Optional[str] = None
    R1: Optional[str] = None
    R2: Optional[str] = None
    R3: Optional[str] = None
    percent_bullish: Optional[str] = None
    percent_bearish: Optional[str] = None
    updated: Optional[datetime] = None
    error: Optional[str] = None


# =============================================================================
# Price Data Models
# =============================================================================

class CandleData(BaseModel):
    """Single candle data."""
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: Optional[float] = None


class PriceDataResponse(BaseModel):
    """Price/candlestick data response."""
    time: List[str] = []
    mid_o: List[float] = Field(default=[], description="Open prices")
    mid_h: List[float] = Field(default=[], description="High prices")
    mid_l: List[float] = Field(default=[], description="Low prices")
    mid_c: List[float] = Field(default=[], description="Close prices")
    candle_count: int = 0
    error: Optional[str] = None


# =============================================================================
# Instrument Models
# =============================================================================

class InstrumentInfo(BaseModel):
    """Trading instrument information."""
    symbol: str
    precision: int
    trade_amount_step: int
    pip_location: float
    display_name: str


class InstrumentsResponse(BaseModel):
    """Available instruments response."""
    instruments: List[InstrumentInfo] = []
    count: int = 0
    error: Optional[str] = None


# =============================================================================
# Trade Models
# =============================================================================

class TradeInfo(BaseModel):
    """Open trade information."""
    id: int
    instrument: str
    price: float
    initial_amount: int
    unrealized_pl: float
    margin_used: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None


class OpenTradesResponse(BaseModel):
    """Open trades response."""
    trades: List[TradeInfo] = []
    count: int = 0
    error: Optional[str] = None


class TradeHistoryItem(BaseModel):
    """Historical trade information."""
    id: int
    instrument: str
    side: str
    amount: int
    entry_price: float
    exit_price: Optional[float] = None
    realized_pl: Optional[float] = None
    closed_at: Optional[datetime] = None
    transaction_type: Optional[str] = None
    transaction_reason: Optional[str] = None
    transaction_timestamp: Optional[int] = None
    trade_id: Optional[int] = None
    trade_type: Optional[str] = None
    position_id: Optional[int] = None
    position_amount: Optional[float] = None
    position_close_price: Optional[float] = None
    balance_movement: Optional[float] = None
    commission: Optional[float] = None
    swap: Optional[float] = None


class TradeHistoryResponse(BaseModel):
    """Trade history response."""
    trades: List[TradeHistoryItem] = []
    count: int = 0
    message: Optional[str] = None
    error: Optional[str] = None


class TradeRequest(BaseModel):
    """Trade placement request."""
    pair: str
    amount: int
    direction: Literal["buy", "sell"]
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None


class TradeResponse(BaseModel):
    """Trade placement response."""
    trade_id: Optional[int] = None
    success: bool = False
    message: str = ""
    error: Optional[str] = None


# =============================================================================
# Error Models
# =============================================================================

class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str
    error_code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)


# =============================================================================
# Bot Status Models
# =============================================================================

class MonitoredPair(BaseModel):
    """Monitored trading pair configuration."""
    symbol: str
    timeframe: str
    is_active: bool = True


class ActiveStrategy(BaseModel):
    """Active trading strategy information."""
    name: str
    description: str
    parameters: Optional[Dict[str, Any]] = None


class BotStatusResponse(BaseModel):
    """Trading bot status response."""
    status: Literal["running", "stopped", "paused", "error", "starting", "stopping"]
    started_at: Optional[datetime] = None
    uptime_seconds: Optional[float] = None
    last_heartbeat: Optional[datetime] = None
    last_signal_time: Optional[datetime] = None
    last_signal_pair: Optional[str] = None
    last_signal_type: Optional[str] = None
    monitored_pairs: List[MonitoredPair] = []
    active_strategy: Optional[ActiveStrategy] = None
    signals_today: int = 0
    trades_today: int = 0
    error_message: Optional[str] = None
    pid: Optional[int] = None
    can_start: bool = True
    can_stop: bool = False


# =============================================================================
# Bot Control Models
# =============================================================================

class BotStartRequest(BaseModel):
    """Request model for starting the trading bot."""
    strategy: Optional[str] = Field(
        default=None,
        description="Strategy name to use (e.g., 'Bollinger Bands Strategy')"
    )
    pairs: Optional[List[str]] = Field(
        default=None,
        description="List of trading pairs to monitor (e.g., ['EURUSD', 'GBPJPY'])"
    )
    timeframe: Optional[str] = Field(
        default=None,
        description="Timeframe for trading (e.g., 'M1', 'H1')"
    )


class BotControlResponse(BaseModel):
    """Response model for bot control operations (start/stop/restart)."""
    success: bool
    message: str
    status: Literal["running", "stopped", "starting", "stopping", "error"]
    pid: Optional[int] = None
    error: Optional[str] = None


# =============================================================================
# Spread Data Models
# =============================================================================

class SpreadResponse(BaseModel):
    """Spread data response for a currency pair."""
    pair: str = Field(..., description="Currency pair (e.g., 'EUR_USD')")
    spread: Optional[float] = Field(None, description="Spread in pips")
    bid: Optional[float] = Field(None, description="Current bid price")
    ask: Optional[float] = Field(None, description="Current ask price")
    timestamp: Optional[datetime] = Field(None, description="Price timestamp")
    error: Optional[str] = Field(None, description="Error message if fetch failed")


# =============================================================================
# Strategy Persistence Models
# =============================================================================

class StrategyIndicator(BaseModel):
    """Indicator instance in a strategy."""
    id: str = Field(..., description="Indicator type ID (e.g., 'sma', 'ema')")
    instance_id: str = Field(..., description="Unique instance ID")
    params: Optional[Dict[str, Any]] = Field(None, description="Indicator parameters")
    color: Optional[str] = Field(None, description="Indicator color")
    line_width: Optional[int] = Field(None, description="Line width")
    line_style: Optional[str] = Field(None, description="Line style (solid, dashed)")
    fill_opacity: Optional[float] = Field(None, description="Fill opacity for area indicators")


class StrategyCondition(BaseModel):
    """Condition in a strategy."""
    id: str = Field(..., description="Unique condition ID")
    section: str = Field(..., description="Condition section (long_entry, long_exit, short_entry, short_exit, entry, exit)")
    left_operand: Dict[str, Any] = Field(..., description="Left operand configuration")
    operator: str = Field(..., description="Comparison operator")
    right_operand: Optional[Dict[str, Any]] = Field(None, description="Right operand configuration")
    indicator_instance_id: Optional[str] = Field(None, description="Associated indicator instance ID")
    indicator_display_name: Optional[str] = Field(None, description="Display name of the indicator")
    pattern_instance_id: Optional[str] = Field(None, description="Associated pattern instance ID")
    is_pattern_condition: Optional[bool] = Field(False, description="Whether this is a pattern condition")


class StrategyPattern(BaseModel):
    """Pattern instance in a strategy."""
    id: str = Field(..., description="Pattern type ID (e.g., 'hammer', 'doji')")
    instance_id: str = Field(..., description="Unique instance ID")
    name: Optional[str] = Field(None, description="Pattern name")
    description: Optional[str] = Field(None, description="Pattern description")
    type: Optional[str] = Field(None, description="Pattern type")
    color: Optional[str] = Field(None, description="Pattern color")


class ConditionGroup(BaseModel):
    """Group of conditions with AND/OR logic."""
    id: str = Field(..., description="Unique group ID")
    operator: str = Field(default="AND", description="Group operator: AND or OR")
    section: str = Field(..., description="Section this group belongs to")
    condition_ids: List[str] = Field(default=[], description="IDs of conditions in this group")
    parent_group_id: Optional[str] = Field(None, description="Parent group ID for nested groups")


class ReferenceIndicator(BaseModel):
    """Reference indicator for multi-timeframe conditions."""
    id: str = Field(..., description="Unique reference indicator ID")
    timeframe: str = Field(..., description="Timeframe for this indicator")
    indicator_id: str = Field(..., description="Base indicator type ID")
    params: Optional[Dict[str, Any]] = Field(None, description="Indicator parameters")


class TimeFilter(BaseModel):
    """Time-based filter for conditions."""
    enabled: bool = Field(default=False, description="Whether time filter is enabled")
    start_hour: Optional[int] = Field(None, description="Start hour (0-23)")
    start_minute: Optional[int] = Field(None, description="Start minute (0-59)")
    end_hour: Optional[int] = Field(None, description="End hour (0-23)")
    end_minute: Optional[int] = Field(None, description="End minute (0-59)")
    days_of_week: List[int] = Field(default=[], description="Days of week (0=Monday to 6=Sunday)")
    timezone: Optional[str] = Field(None, description="Timezone for time filter")


class StrategyConfig(BaseModel):
    """Complete strategy configuration."""
    id: Optional[str] = Field(None, description="Strategy ID (generated on save)")
    name: str = Field(..., description="Strategy name", max_length=50)
    description: Optional[str] = Field(None, description="Strategy description", max_length=500)
    tags: List[str] = Field(default=[], description="Strategy tags")
    trade_direction: Literal["long", "short", "both"] = Field(
        default="both",
        description="Trade direction: long, short, or both"
    )
    confirm_on_candle_close: str = Field(default="yes", description="Candle close confirmation setting")
    pair: Optional[str] = Field(None, description="Currency pair")
    timeframe: Optional[str] = Field(None, description="Timeframe")
    candle_count: Optional[str] = Field(None, description="Number of candles to display")
    indicators: List[StrategyIndicator] = Field(default=[], description="Indicator instances")
    patterns: List[StrategyPattern] = Field(default=[], description="Pattern instances")
    conditions: List[StrategyCondition] = Field(default=[], description="Trading conditions")
    groups: List[ConditionGroup] = Field(default=[], description="Condition groups with AND/OR logic")
    reference_indicators: List[ReferenceIndicator] = Field(default=[], description="Multi-timeframe reference indicators")
    time_filter: Optional[TimeFilter] = Field(None, description="Time-based filter")
    drawings: List[Dict[str, Any]] = Field(default=[], description="Chart drawings (horizontal lines, trendlines, etc.)")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")


class SaveStrategyRequest(BaseModel):
    """Request to save a strategy."""
    strategy: StrategyConfig = Field(..., description="Strategy configuration to save")


class SaveStrategyResponse(BaseModel):
    """Response from saving a strategy."""
    success: bool = Field(..., description="Whether the save was successful")
    strategy_id: Optional[str] = Field(None, description="ID of the saved strategy")
    message: str = Field(..., description="Success or error message")
    error: Optional[str] = Field(None, description="Error details if failed")


class LoadStrategyResponse(BaseModel):
    """Response from loading a strategy."""
    success: bool = Field(..., description="Whether the load was successful")
    strategy: Optional[StrategyConfig] = Field(None, description="Loaded strategy configuration")
    error: Optional[str] = Field(None, description="Error details if failed")


class StrategyListItem(BaseModel):
    """Strategy list item for browsing."""
    id: str = Field(..., description="Strategy ID")
    name: str = Field(..., description="Strategy name")
    description: Optional[str] = Field(None, description="Strategy description")
    tags: List[str] = Field(default=[], description="Strategy tags")
    trade_direction: Literal["long", "short", "both"] = Field(..., description="Trade direction")
    pair: Optional[str] = Field(None, description="Currency pair")
    timeframe: Optional[str] = Field(None, description="Timeframe")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")


class ListStrategiesResponse(BaseModel):
    """Response from listing strategies."""
    success: bool = Field(..., description="Whether the list was successful")
    strategies: List[StrategyListItem] = Field(default=[], description="List of strategies")
    count: int = Field(0, description="Number of strategies")
    error: Optional[str] = Field(None, description="Error details if failed")


class CheckNameResponse(BaseModel):
    """Response from checking if a strategy name exists."""
    exists: bool = Field(..., description="Whether a strategy with this name exists")
    strategy_id: Optional[str] = Field(None, description="ID of existing strategy if found")


class DeleteStrategyResponse(BaseModel):
    """Response from deleting a strategy."""
    success: bool = Field(..., description="Whether the delete was successful")
    message: str = Field(..., description="Success or error message")
    error: Optional[str] = Field(None, description="Error details if failed")


class StrategyDraft(BaseModel):
    """Auto-saved draft of a strategy."""
    strategy: StrategyConfig = Field(..., description="Draft strategy configuration")
    saved_at: datetime = Field(..., description="When the draft was saved")
    is_auto_save: bool = Field(default=True, description="Whether this was auto-saved")


# =============================================================================
# Strategy Management Models (Load, Duplicate, Export, Import)
# =============================================================================

class StrategyListItemExtended(BaseModel):
    """Extended strategy list item with additional metadata for browsing."""
    id: str = Field(..., description="Strategy ID")
    name: str = Field(..., description="Strategy name")
    description: Optional[str] = Field(None, description="Strategy description")
    tags: List[str] = Field(default=[], description="Strategy tags")
    trade_direction: Literal["long", "short", "both"] = Field(..., description="Trade direction")
    pair: Optional[str] = Field(None, description="Currency pair")
    timeframe: Optional[str] = Field(None, description="Timeframe")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    # Extended metadata
    indicator_count: int = Field(default=0, description="Number of indicators")
    condition_count: int = Field(default=0, description="Number of conditions")
    drawing_count: int = Field(default=0, description="Number of drawings")
    pattern_count: int = Field(default=0, description="Number of patterns")


class ListStrategiesExtendedResponse(BaseModel):
    """Response from listing strategies with extended metadata."""
    success: bool = Field(..., description="Whether the list was successful")
    strategies: List[StrategyListItemExtended] = Field(default=[], description="List of strategies with extended metadata")
    count: int = Field(0, description="Number of strategies")
    error: Optional[str] = Field(None, description="Error details if failed")


class StrategyExport(BaseModel):
    """Export schema for strategy files."""
    schema_version: str = Field(default="1.0", description="Export schema version")
    export_date: datetime = Field(..., description="When the export was created")
    strategy: StrategyConfig = Field(..., description="Full strategy configuration")


class DuplicateStrategyResponse(BaseModel):
    """Response from duplicating a strategy."""
    success: bool = Field(..., description="Whether the duplicate was successful")
    strategy_id: Optional[str] = Field(None, description="ID of the new duplicated strategy")
    strategy_name: Optional[str] = Field(None, description="Name of the new duplicated strategy")
    message: str = Field(..., description="Success or error message")
    error: Optional[str] = Field(None, description="Error details if failed")


class ImportValidationResult(BaseModel):
    """Result of validating an import file."""
    valid: bool = Field(..., description="Whether the import data is valid")
    errors: List[str] = Field(default=[], description="Validation errors")
    warnings: List[str] = Field(default=[], description="Validation warnings")
    strategy_preview: Optional[Dict[str, Any]] = Field(None, description="Preview of strategy data if valid")
    name_conflict: bool = Field(default=False, description="Whether the name conflicts with existing strategy")
    conflicting_strategy_id: Optional[str] = Field(None, description="ID of conflicting strategy if any")


class ImportStrategyRequest(BaseModel):
    """Request to import a strategy."""
    strategy_data: Dict[str, Any] = Field(..., description="Raw strategy JSON data")


class ImportStrategySaveRequest(BaseModel):
    """Request to save an imported strategy."""
    strategy_data: Dict[str, Any] = Field(..., description="Validated strategy data")
    name_override: Optional[str] = Field(None, description="Optional name to use instead of original")
    conflict_resolution: Optional[Literal["rename", "replace", "keep_both"]] = Field(
        None, description="How to resolve name conflicts"
    )


class ImportStrategyResponse(BaseModel):
    """Response from importing a strategy."""
    success: bool = Field(..., description="Whether the import was successful")
    strategy_id: Optional[str] = Field(None, description="ID of the imported strategy")
    strategy_name: Optional[str] = Field(None, description="Name of the imported strategy")
    message: str = Field(..., description="Success or error message")
    error: Optional[str] = Field(None, description="Error details if failed")
