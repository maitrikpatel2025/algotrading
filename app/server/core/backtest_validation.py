"""
Backtest Validation Service
============================
Service for validating backtest configurations, checking data availability,
and providing risk warnings.
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from core.data_models import BacktestConfig
from db.supabase_client import get_supabase_client, is_configured

logger = logging.getLogger(__name__)


class ValidationResult:
    """Result of a validation check."""

    def __init__(self, valid: bool, errors: List[str] = None, warnings: List[str] = None):
        self.valid = valid
        self.errors = errors or []
        self.warnings = warnings or []


def validate_configuration(config: BacktestConfig) -> ValidationResult:
    """
    Perform comprehensive validation of a backtest configuration.

    Args:
        config: Backtest configuration to validate

    Returns:
        ValidationResult with errors and warnings
    """
    errors = []
    warnings = []

    # Validate date range
    date_valid, date_errors, date_warnings = validate_date_range(
        config.start_date, config.end_date
    )
    errors.extend(date_errors)
    warnings.extend(date_warnings)

    # Validate SL/TP configuration
    sl_tp_valid, sl_tp_errors = validate_sl_tp_configuration(config.risk_management)
    errors.extend(sl_tp_errors)

    # Validate leverage
    if config.position_sizing.leverage > 50:
        warnings.append(
            f"High leverage ({config.position_sizing.leverage}:1) increases risk significantly"
        )

    # Validate initial balance
    if config.initial_balance < 100:
        errors.append("Initial balance must be at least $100")
    elif config.initial_balance > 10000000:
        errors.append("Initial balance must be less than $10,000,000")

    # Validate position sizing
    if config.position_sizing.method == "percentage":
        if config.position_sizing.value <= 0 or config.position_sizing.value > 100:
            errors.append("Position size percentage must be between 0 and 100")
    elif config.position_sizing.method == "risk_based":
        if config.position_sizing.value <= 0 or config.position_sizing.value > 100:
            errors.append("Risk percentage must be between 0 and 100")

    # Validate strategy exists
    if config.strategy_id:
        if not is_configured():
            warnings.append("Database not configured, cannot verify strategy exists")
        else:
            client = get_supabase_client()
            if client:
                response = client.table("strategies").select("id").eq("id", config.strategy_id).execute()
                if not response.data:
                    errors.append(f"Strategy with ID {config.strategy_id} does not exist")

    return ValidationResult(valid=len(errors) == 0, errors=errors, warnings=warnings)


def check_data_availability(
    pair: Optional[str], timeframe: Optional[str], start_date: datetime, end_date: datetime
) -> Tuple[bool, str, Optional[List[Dict[str, Any]]]]:
    """
    Check if historical data is available for the specified parameters.

    Args:
        pair: Currency pair (e.g., "EUR_USD")
        timeframe: Timeframe (e.g., "H1", "M5")
        start_date: Start date for data
        end_date: End date for data

    Returns:
        Tuple of (available, message, gaps)
        - available: True if data is likely available
        - message: Human-readable message about data availability
        - gaps: List of data gaps if any (None if not checked in detail)
    """
    if not pair or not timeframe:
        return False, "Currency pair and timeframe are required", None

    # For now, we'll provide a simplified check
    # In a full implementation, this would query the data provider
    # to verify actual data availability

    # Check date range is not in the future
    now = datetime.now()
    if start_date > now or end_date > now:
        return False, "Cannot check data availability for future dates", None

    # Check date range is not too old (assume data available for last 10 years)
    ten_years_ago = now - timedelta(days=365 * 10)
    if start_date < ten_years_ago:
        return (
            True,
            f"Warning: Data may be limited for dates before {ten_years_ago.strftime('%Y-%m-%d')}",
            None,
        )

    # For common pairs and timeframes, assume data is available
    common_pairs = [
        "EUR_USD",
        "GBP_USD",
        "USD_JPY",
        "USD_CHF",
        "AUD_USD",
        "USD_CAD",
        "NZD_USD",
        "EUR_GBP",
        "EUR_JPY",
        "GBP_JPY",
    ]

    if pair in common_pairs:
        return True, "Historical data is available for the selected period", None
    else:
        return (
            True,
            f"Data availability for {pair} should be verified before running backtest",
            None,
        )


def calculate_estimated_duration(
    pair: Optional[str],
    timeframe: Optional[str],
    start_date: datetime,
    end_date: datetime,
    strategy_complexity: str = "medium",
) -> Optional[int]:
    """
    Estimate the duration of a backtest execution in seconds.

    Args:
        pair: Currency pair
        timeframe: Timeframe
        start_date: Start date
        end_date: End date
        strategy_complexity: Complexity estimate ("simple", "medium", "complex")

    Returns:
        Estimated duration in seconds, or None if cannot estimate
    """
    try:
        # Calculate number of candles based on timeframe
        duration = end_date - start_date
        total_minutes = duration.total_seconds() / 60

        # Map timeframe to minutes per candle
        timeframe_minutes = {
            "M1": 1,
            "M5": 5,
            "M15": 15,
            "M30": 30,
            "H1": 60,
            "H4": 240,
            "D": 1440,
        }

        minutes_per_candle = timeframe_minutes.get(timeframe, 60)
        estimated_candles = int(total_minutes / minutes_per_candle)

        # Estimate processing time per candle based on complexity
        # Simple: 0.001s, Medium: 0.005s, Complex: 0.01s per candle
        time_per_candle = {"simple": 0.001, "medium": 0.005, "complex": 0.01}
        processing_time = time_per_candle.get(strategy_complexity, 0.005)

        estimated_seconds = estimated_candles * processing_time

        # Add base overhead (5 seconds for setup and teardown)
        estimated_seconds += 5

        return int(estimated_seconds)
    except Exception as e:
        logger.error(f"Failed to estimate duration: {e}")
        return None


def get_risk_warnings(config: BacktestConfig) -> List[str]:
    """
    Identify high-risk settings in the configuration.

    Args:
        config: Backtest configuration

    Returns:
        List of risk warning messages
    """
    warnings = []

    # Check leverage
    if config.position_sizing.leverage > 50:
        warnings.append(
            f"⚠️ High Leverage: Using {config.position_sizing.leverage}:1 leverage "
            "significantly increases both potential profits and losses"
        )

    if config.position_sizing.leverage > 100:
        warnings.append(
            f"⚠️ Extreme Leverage: {config.position_sizing.leverage}:1 leverage is extremely risky "
            "and can lead to rapid account loss"
        )

    # Check stop loss
    if config.risk_management.stop_loss.type == "none":
        warnings.append(
            "⚠️ No Stop Loss: Trading without stop loss exposes account to unlimited downside risk"
        )

    # Check take profit
    if config.risk_management.take_profit.type == "none":
        warnings.append(
            "⚠️ No Take Profit: Consider setting take profit targets to lock in gains"
        )

    # Check position sizing
    if config.position_sizing.method == "percentage":
        if config.position_sizing.value > 50:
            warnings.append(
                f"⚠️ Large Position Size: Using {config.position_sizing.value}% of account per trade "
                "increases risk of large drawdowns"
            )
    elif config.position_sizing.method == "risk_based":
        if config.position_sizing.value > 5:
            warnings.append(
                f"⚠️ High Risk Per Trade: Risking {config.position_sizing.value}% per trade "
                "can lead to significant drawdowns during losing streaks"
            )

    # Check if compounding is disabled with small balance
    if not config.position_sizing.compound and config.initial_balance < 1000:
        warnings.append(
            "💡 Compounding Disabled: With small initial balance, disabling compounding "
            "may limit profit potential"
        )

    return warnings


def validate_date_range(
    start_date: datetime, end_date: datetime
) -> Tuple[bool, List[str], List[str]]:
    """
    Validate date range for backtest.

    Args:
        start_date: Start date
        end_date: End date

    Returns:
        Tuple of (valid, errors, warnings)
    """
    errors = []
    warnings = []

    # Check end date is after start date
    if end_date <= start_date:
        errors.append("End date must be after start date")
        return False, errors, warnings

    # Check dates are not in the future
    now = datetime.now()
    if start_date > now:
        errors.append("Start date cannot be in the future")
    if end_date > now:
        errors.append("End date cannot be in the future")

    if errors:
        return False, errors, warnings

    # Calculate duration
    duration = end_date - start_date
    days = duration.days

    # Check for too short range
    if days < 7:
        warnings.append(
            f"Short Date Range: {days} days may not provide enough data for reliable results. "
            "Consider using at least 7 days."
        )

    # Check for too long range
    if days > 3650:  # 10 years
        warnings.append(
            f"Long Date Range: {days} days ({days // 365} years) may result in long execution time. "
            "Consider breaking into smaller periods."
        )

    return True, errors, warnings


def validate_sl_tp_configuration(risk_management: Any) -> Tuple[bool, List[str]]:
    """
    Validate that at least one of stop loss or take profit is configured.

    Args:
        risk_management: Risk management configuration

    Returns:
        Tuple of (valid, errors)
    """
    errors = []

    sl_type = risk_management.stop_loss.type if risk_management.stop_loss else "none"
    tp_type = risk_management.take_profit.type if risk_management.take_profit else "none"

    # Check if both are none
    if sl_type == "none" and tp_type == "none":
        errors.append(
            "Risk Management Required: At least one of stop loss or take profit must be configured. "
            "Trading without exit rules is not recommended."
        )

    # Validate SL value if set
    if sl_type != "none" and risk_management.stop_loss.value is not None:
        if risk_management.stop_loss.value <= 0:
            errors.append("Stop loss value must be greater than 0")

    # Validate TP value if set
    if tp_type != "none" and risk_management.take_profit.value is not None:
        if risk_management.take_profit.value <= 0:
            errors.append("Take profit value must be greater than 0")

    return len(errors) == 0, errors
