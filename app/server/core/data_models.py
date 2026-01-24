"""
Pydantic Data Models
====================
Request and response models for the Forex Trading API.
"""

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Union

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
        default=None, description="Strategy name to use (e.g., 'Bollinger Bands Strategy')"
    )
    pairs: Optional[List[str]] = Field(
        default=None, description="List of trading pairs to monitor (e.g., ['EURUSD', 'GBPJPY'])"
    )
    timeframe: Optional[str] = Field(
        default=None, description="Timeframe for trading (e.g., 'M1', 'H1')"
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
    section: str = Field(
        ...,
        description="Condition section (long_entry, long_exit, short_entry, short_exit, entry, exit)",
    )
    left_operand: Dict[str, Any] = Field(..., description="Left operand configuration")
    operator: str = Field(..., description="Comparison operator")
    right_operand: Optional[Dict[str, Any]] = Field(None, description="Right operand configuration")
    indicator_instance_id: Optional[str] = Field(
        None, description="Associated indicator instance ID"
    )
    indicator_display_name: Optional[str] = Field(None, description="Display name of the indicator")
    pattern_instance_id: Optional[str] = Field(None, description="Associated pattern instance ID")
    is_pattern_condition: Optional[bool] = Field(
        False, description="Whether this is a pattern condition"
    )


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
        default="both", description="Trade direction: long, short, or both"
    )
    confirm_on_candle_close: str = Field(
        default="yes", description="Candle close confirmation setting"
    )
    pair: Optional[str] = Field(None, description="Currency pair")
    timeframe: Optional[str] = Field(None, description="Timeframe")
    candle_count: Union[int, str, None] = Field(None, description="Number of candles to display")
    indicators: List[StrategyIndicator] = Field(default=[], description="Indicator instances")
    patterns: List[StrategyPattern] = Field(default=[], description="Pattern instances")
    conditions: List[StrategyCondition] = Field(default=[], description="Trading conditions")
    groups: List[ConditionGroup] = Field(
        default=[], description="Condition groups with AND/OR logic"
    )
    reference_indicators: List[ReferenceIndicator] = Field(
        default=[], description="Multi-timeframe reference indicators"
    )
    time_filter: Optional[TimeFilter] = Field(None, description="Time-based filter")
    drawings: List[Dict[str, Any]] = Field(
        default=[], description="Chart drawings (horizontal lines, trendlines, etc.)"
    )
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
    strategies: List[StrategyListItemExtended] = Field(
        default=[], description="List of strategies with extended metadata"
    )
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
    strategy_preview: Optional[Dict[str, Any]] = Field(
        None, description="Preview of strategy data if valid"
    )
    name_conflict: bool = Field(
        default=False, description="Whether the name conflicts with existing strategy"
    )
    conflicting_strategy_id: Optional[str] = Field(
        None, description="ID of conflicting strategy if any"
    )


class ImportStrategyRequest(BaseModel):
    """Request to import a strategy."""

    strategy_data: Dict[str, Any] = Field(..., description="Raw strategy JSON data")


class ImportStrategySaveRequest(BaseModel):
    """Request to save an imported strategy."""

    strategy_data: Dict[str, Any] = Field(..., description="Validated strategy data")
    name_override: Optional[str] = Field(
        None, description="Optional name to use instead of original"
    )
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


# =============================================================================
# Backtest Configuration Models
# =============================================================================


class PositionSizingConfig(BaseModel):
    """Position sizing configuration for a backtest."""

    method: Literal["fixed_lot", "fixed_dollar", "percentage", "risk_based"] = Field(
        default="percentage", description="Position sizing method"
    )
    value: float = Field(
        default=2.0,
        description="Value for the sizing method (lots, dollars, percentage, or risk %)",
    )
    leverage: int = Field(default=1, ge=1, le=500, description="Leverage ratio (1:1 to 1:500)")
    max_position_size: Optional[float] = Field(None, description="Maximum position size cap")
    compound: bool = Field(
        default=True, description="Whether to reinvest profits (True) or use fixed base (False)"
    )


class StopLossConfig(BaseModel):
    """Stop loss configuration."""

    type: Literal["fixed_pips", "fixed_dollar", "atr_based", "percentage", "none"] = Field(
        default="none", description="Stop loss type"
    )
    value: Optional[float] = Field(None, description="Stop loss value based on type")


class TakeProfitConfig(BaseModel):
    """Take profit configuration."""

    type: Literal[
        "fixed_pips", "fixed_dollar", "atr_based", "percentage", "risk_reward", "none"
    ] = Field(default="none", description="Take profit type")
    value: Optional[float] = Field(None, description="Take profit value based on type")


class TrailingStopConfig(BaseModel):
    """Trailing stop configuration."""

    type: Literal["fixed_pips", "atr_based", "percentage", "break_even", "none"] = Field(
        default="none", description="Trailing stop type"
    )
    value: Optional[float] = Field(None, description="Trailing stop value based on type")
    break_even_trigger: Optional[float] = Field(
        None, description="Price move to trigger break-even (in pips or %)"
    )


class PartialCloseLevel(BaseModel):
    """A single partial close level."""

    target_pips: float = Field(..., description="Target profit in pips to trigger partial close")
    close_percentage: float = Field(
        ..., ge=1, le=100, description="Percentage of position to close (1-100)"
    )


class PartialClosesConfig(BaseModel):
    """Partial closes configuration."""

    enabled: bool = Field(default=False, description="Whether partial closes are enabled")
    levels: List[PartialCloseLevel] = Field(default=[], description="List of partial close levels")


class RiskManagementConfig(BaseModel):
    """Complete risk management configuration for a backtest."""

    stop_loss: StopLossConfig = Field(
        default_factory=StopLossConfig, description="Stop loss settings"
    )
    take_profit: TakeProfitConfig = Field(
        default_factory=TakeProfitConfig, description="Take profit settings"
    )
    trailing_stop: TrailingStopConfig = Field(
        default_factory=TrailingStopConfig, description="Trailing stop settings"
    )
    partial_closes: PartialClosesConfig = Field(
        default_factory=PartialClosesConfig, description="Partial close settings"
    )


class BacktestConfig(BaseModel):
    """Complete backtest configuration."""

    id: Optional[str] = Field(None, description="Backtest ID (generated on save)")
    name: str = Field(..., description="Backtest name", max_length=100)
    description: Optional[str] = Field(None, description="Backtest description", max_length=500)
    strategy_id: Optional[str] = Field(None, description="ID of the strategy to backtest")
    strategy_name: Optional[str] = Field(None, description="Name of the strategy (for display)")
    pair: Optional[str] = Field(None, description="Currency pair")
    timeframe: Optional[str] = Field(None, description="Timeframe")
    start_date: datetime = Field(..., description="Backtest start date")
    end_date: datetime = Field(..., description="Backtest end date")
    initial_balance: float = Field(
        default=10000.0, ge=100, le=10000000, description="Initial account balance"
    )
    currency: Literal["USD", "EUR", "GBP"] = Field(default="USD", description="Account currency")
    position_sizing: PositionSizingConfig = Field(
        default_factory=PositionSizingConfig, description="Position sizing configuration"
    )
    risk_management: RiskManagementConfig = Field(
        default_factory=RiskManagementConfig, description="Risk management configuration"
    )
    status: Literal["pending", "running", "cancelling", "completed", "failed"] = Field(
        default="pending", description="Backtest status"
    )
    results: Optional[Dict[str, Any]] = Field(
        None, description="Backtest results (null until completed)"
    )
    notes: Optional[str] = Field(None, description="Custom notes and annotations")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")


class BacktestListItem(BaseModel):
    """Backtest list item for library display."""

    id: str = Field(..., description="Backtest ID")
    name: str = Field(..., description="Backtest name")
    description: Optional[str] = Field(None, description="Backtest description")
    strategy_id: Optional[str] = Field(None, description="Strategy ID")
    strategy_name: Optional[str] = Field(None, description="Strategy name")
    pair: Optional[str] = Field(None, description="Currency pair")
    timeframe: Optional[str] = Field(None, description="Timeframe")
    start_date: datetime = Field(..., description="Backtest start date")
    end_date: datetime = Field(..., description="Backtest end date")
    initial_balance: float = Field(..., description="Initial account balance")
    currency: str = Field(..., description="Account currency")
    status: str = Field(..., description="Backtest status")
    results: Optional[Dict[str, Any]] = Field(None, description="Backtest results summary")
    notes: Optional[str] = Field(None, description="Custom notes and annotations")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")


class SaveBacktestRequest(BaseModel):
    """Request to save a backtest."""

    backtest: BacktestConfig = Field(..., description="Backtest configuration to save")


class SaveBacktestResponse(BaseModel):
    """Response from saving a backtest."""

    success: bool = Field(..., description="Whether the save was successful")
    backtest_id: Optional[str] = Field(None, description="ID of the saved backtest")
    message: str = Field(..., description="Success or error message")
    error: Optional[str] = Field(None, description="Error details if failed")


class LoadBacktestResponse(BaseModel):
    """Response from loading a backtest."""

    success: bool = Field(..., description="Whether the load was successful")
    backtest: Optional[BacktestConfig] = Field(None, description="Loaded backtest configuration")
    error: Optional[str] = Field(None, description="Error details if failed")


class ListBacktestsResponse(BaseModel):
    """Response from listing backtests."""

    success: bool = Field(..., description="Whether the list was successful")
    backtests: List[BacktestListItem] = Field(default=[], description="List of backtests")
    count: int = Field(0, description="Number of backtests")
    error: Optional[str] = Field(None, description="Error details if failed")


class DeleteBacktestResponse(BaseModel):
    """Response from deleting a backtest."""

    success: bool = Field(..., description="Whether the delete was successful")
    message: str = Field(..., description="Success or error message")
    error: Optional[str] = Field(None, description="Error details if failed")


class DuplicateBacktestResponse(BaseModel):
    """Response from duplicating a backtest."""

    success: bool = Field(..., description="Whether the duplicate was successful")
    backtest_id: Optional[str] = Field(None, description="ID of the new duplicated backtest")
    backtest_name: Optional[str] = Field(None, description="Name of the new duplicated backtest")
    message: str = Field(..., description="Success or error message")
    error: Optional[str] = Field(None, description="Error details if failed")


# ============================================================================
# Backtest Execution Progress Models
# ============================================================================


class BacktestProgress(BaseModel):
    """Current progress of a running backtest."""

    backtest_id: str = Field(..., description="ID of the backtest")
    status: Literal["pending", "running", "cancelling", "completed", "failed"] = Field(
        ..., description="Current backtest status"
    )
    progress_percentage: int = Field(
        default=0, ge=0, le=100, description="Execution progress as percentage (0-100)"
    )
    current_date: Optional[datetime] = Field(None, description="Current date being processed")
    candles_processed: int = Field(
        default=0, ge=0, description="Number of candles processed so far"
    )
    total_candles: Optional[int] = Field(
        None, ge=0, description="Total number of candles to process"
    )
    trade_count: int = Field(default=0, ge=0, description="Number of trades simulated so far")
    estimated_seconds_remaining: Optional[float] = Field(
        None, ge=0, description="Estimated seconds remaining for completion"
    )
    error_message: Optional[str] = Field(None, description="Error message if backtest failed")
    started_at: Optional[datetime] = Field(None, description="When the backtest execution started")
    # Live performance metrics for progress visualization
    current_pnl: Optional[float] = Field(
        None, description="Current cumulative P/L during execution"
    )
    running_win_rate: Optional[float] = Field(
        None, ge=0, le=100, description="Running win rate as percentage (0-100)"
    )
    current_drawdown: Optional[float] = Field(
        None, ge=0, description="Current drawdown as percentage from peak equity"
    )
    equity_curve: Optional[List[float]] = Field(
        None, description="Last 50 equity curve points for mini chart"
    )
    peak_equity: Optional[float] = Field(
        None, description="Peak equity value for drawdown calculation"
    )


class RunBacktestRequest(BaseModel):
    """Request to run a backtest."""

    keep_partial_on_cancel: bool = Field(
        default=False, description="Whether to save partial results if cancelled"
    )


class RunBacktestResponse(BaseModel):
    """Response from starting a backtest run."""

    success: bool = Field(..., description="Whether the backtest started successfully")
    message: str = Field(..., description="Success or error message")
    error: Optional[str] = Field(None, description="Error details if failed")


class BacktestProgressResponse(BaseModel):
    """Response containing backtest progress information."""

    success: bool = Field(..., description="Whether the progress query was successful")
    progress: Optional[BacktestProgress] = Field(None, description="Current backtest progress")
    error: Optional[str] = Field(None, description="Error details if failed")


class CancelBacktestRequest(BaseModel):
    """Request to cancel a running backtest."""

    keep_partial_results: bool = Field(
        default=False, description="Whether to keep partial results from the cancelled backtest"
    )


class CancelBacktestResponse(BaseModel):
    """Response from cancelling a backtest."""

    success: bool = Field(..., description="Whether the cancellation was successful")
    message: str = Field(..., description="Success or error message")
    partial_results_saved: bool = Field(
        default=False, description="Whether partial results were saved"
    )
    error: Optional[str] = Field(None, description="Error details if failed")


# ============================================================================
# Backtest Results Summary Models
# ============================================================================


class BacktestResultsSummary(BaseModel):
    """Comprehensive backtest results summary with all performance metrics."""

    # Core P/L metrics
    total_net_profit: float = Field(default=0.0, description="Total Net Profit/Loss ($)")
    return_on_investment: float = Field(default=0.0, description="ROI (%)")
    final_balance: float = Field(default=0.0, description="Final account balance")

    # Trade counts
    total_trades: int = Field(default=0, description="Total number of trades")
    winning_trades: int = Field(default=0, description="Number of winning trades")
    losing_trades: int = Field(default=0, description="Number of losing trades")
    win_rate: float = Field(default=0.0, description="Win Rate (%)")

    # Profit metrics
    profit_factor: float = Field(default=0.0, description="Gross profit / gross loss")
    average_win: float = Field(default=0.0, description="Average profit from winning trades ($)")
    average_loss: float = Field(default=0.0, description="Average loss from losing trades ($)")
    win_loss_ratio: float = Field(default=0.0, description="Average win / average loss")
    largest_win: float = Field(default=0.0, description="Largest single winning trade ($)")
    largest_loss: float = Field(default=0.0, description="Largest single losing trade ($)")
    expectancy: float = Field(default=0.0, description="Expected value per trade ($)")

    # Time metrics
    average_trade_duration_minutes: float = Field(
        default=0.0, description="Average trade duration in minutes"
    )

    # Risk metrics
    max_drawdown_dollars: float = Field(default=0.0, description="Maximum Drawdown ($)")
    max_drawdown_percent: float = Field(default=0.0, description="Maximum Drawdown (%)")
    recovery_factor: float = Field(default=0.0, description="Net profit / max drawdown")
    sharpe_ratio: Optional[float] = Field(
        default=None, description="Risk-adjusted return (annualized)"
    )
    sortino_ratio: Optional[float] = Field(
        default=None, description="Downside risk-adjusted return"
    )

    # Benchmark comparison
    buy_hold_return: float = Field(default=0.0, description="Buy-and-hold benchmark return (%)")
    strategy_vs_benchmark: float = Field(
        default=0.0, description="Strategy return minus buy-hold return"
    )

    # Equity curves for visualization
    equity_curve: List[float] = Field(default=[], description="Full equity curve data points")
    buy_hold_curve: List[float] = Field(
        default=[], description="Buy-and-hold equity curve for comparison"
    )

    # Enhanced equity curve data for interactive charting
    equity_curve_dates: Optional[List[str]] = Field(
        default=None, description="ISO 8601 date strings for each equity curve point"
    )
    trade_counts_per_candle: Optional[List[int]] = Field(
        default=None, description="Number of trades executed at each candle"
    )
    drawdown_periods: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="List of drawdown periods with start_index, end_index, max_drawdown_pct",
    )

    # Trade list for detailed view
    trades: List[Dict[str, Any]] = Field(default=[], description="List of all trades")

    # Time period performance metrics
    monthly_performance: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Monthly performance breakdown: [{month: 'YYYY-MM', trades: int, win_rate: float, net_pnl: float, is_best: bool, is_worst: bool}]",
    )
    day_of_week_performance: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Day of week performance: [{day: 0-6, day_name: str, trades: int, win_rate: float, net_pnl: float, is_best: bool, is_worst: bool}]",
    )
    hourly_performance: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Hourly performance: [{hour: 0-23, trades: int, win_rate: float, net_pnl: float, is_best: bool, is_worst: bool}]",
    )
    day_hour_heatmap: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Day-hour heatmap data: [{day: 0-6, hour: 0-23, net_pnl: float, trades: int}]",
    )
