"""
Tests for Backtest Validation Service
======================================
"""

from datetime import datetime, timedelta

from core.backtest_validation import (
    calculate_estimated_duration,
    check_data_availability,
    get_risk_warnings,
    validate_configuration,
    validate_date_range,
    validate_sl_tp_configuration,
)
from core.data_models import (
    BacktestConfig,
    PositionSizingConfig,
    RiskManagementConfig,
    StopLossConfig,
    TakeProfitConfig,
)


def test_validate_date_range_valid():
    """Test validation of valid date range."""
    start = datetime(2024, 1, 1)
    end = datetime(2024, 12, 31)
    valid, errors, warnings = validate_date_range(start, end)
    assert valid is True
    assert len(errors) == 0


def test_validate_date_range_reversed():
    """Test validation rejects end date before start date."""
    start = datetime(2024, 12, 31)
    end = datetime(2024, 1, 1)
    valid, errors, warnings = validate_date_range(start, end)
    assert valid is False
    assert "End date must be after start date" in errors[0]


def test_validate_date_range_future():
    """Test validation rejects future dates."""
    start = datetime.now() + timedelta(days=10)
    end = datetime.now() + timedelta(days=20)
    valid, errors, warnings = validate_date_range(start, end)
    assert valid is False
    assert any("future" in error.lower() for error in errors)


def test_validate_date_range_too_short():
    """Test warning for date range less than 7 days."""
    start = datetime(2024, 1, 1)
    end = datetime(2024, 1, 5)  # 4 days
    valid, errors, warnings = validate_date_range(start, end)
    assert valid is True
    assert len(errors) == 0
    assert any("Short Date Range" in warning for warning in warnings)


def test_validate_date_range_too_long():
    """Test warning for date range more than 10 years."""
    start = datetime(2010, 1, 1)
    end = datetime(2025, 1, 1)  # 15 years
    valid, errors, warnings = validate_date_range(start, end)
    assert valid is True
    assert len(errors) == 0
    assert any("Long Date Range" in warning for warning in warnings)


def test_validate_sl_tp_configuration_both_none():
    """Test validation fails when both SL and TP are none."""
    risk_mgmt = RiskManagementConfig(
        stop_loss=StopLossConfig(type="none"), take_profit=TakeProfitConfig(type="none")
    )
    valid, errors = validate_sl_tp_configuration(risk_mgmt)
    assert valid is False
    assert any("Risk Management Required" in error for error in errors)


def test_validate_sl_tp_configuration_sl_set():
    """Test validation passes when SL is set."""
    risk_mgmt = RiskManagementConfig(
        stop_loss=StopLossConfig(type="fixed_pips", value=20),
        take_profit=TakeProfitConfig(type="none"),
    )
    valid, errors = validate_sl_tp_configuration(risk_mgmt)
    assert valid is True
    assert len(errors) == 0


def test_validate_sl_tp_configuration_tp_set():
    """Test validation passes when TP is set."""
    risk_mgmt = RiskManagementConfig(
        stop_loss=StopLossConfig(type="none"),
        take_profit=TakeProfitConfig(type="fixed_pips", value=40),
    )
    valid, errors = validate_sl_tp_configuration(risk_mgmt)
    assert valid is True
    assert len(errors) == 0


def test_validate_sl_tp_configuration_invalid_values():
    """Test validation fails for invalid SL/TP values."""
    risk_mgmt = RiskManagementConfig(
        stop_loss=StopLossConfig(type="fixed_pips", value=-10),
        take_profit=TakeProfitConfig(type="fixed_pips", value=0),
    )
    valid, errors = validate_sl_tp_configuration(risk_mgmt)
    assert valid is False
    assert len(errors) == 2


def test_check_data_availability_common_pair():
    """Test data availability check for common pair."""
    start = datetime(2024, 1, 1)
    end = datetime(2024, 3, 1)
    available, message, gaps = check_data_availability("EUR_USD", "H1", start, end)
    assert available is True
    assert "available" in message.lower()


def test_check_data_availability_future_dates():
    """Test data availability check rejects future dates."""
    start = datetime.now() + timedelta(days=10)
    end = datetime.now() + timedelta(days=20)
    available, message, gaps = check_data_availability("EUR_USD", "H1", start, end)
    assert available is False
    assert "future" in message.lower()


def test_check_data_availability_no_pair():
    """Test data availability check requires pair."""
    start = datetime(2024, 1, 1)
    end = datetime(2024, 3, 1)
    available, message, gaps = check_data_availability(None, "H1", start, end)
    assert available is False
    assert "required" in message.lower()


def test_calculate_estimated_duration():
    """Test estimation of backtest duration."""
    start = datetime(2024, 1, 1)
    end = datetime(2024, 1, 8)  # 7 days
    duration = calculate_estimated_duration("EUR_USD", "H1", start, end, "medium")
    assert duration is not None
    assert duration > 0
    # 7 days * 24 hours = 168 candles, at 0.005s per candle = ~0.84s + 5s overhead
    assert 5 < duration < 15


def test_get_risk_warnings_high_leverage():
    """Test risk warning for high leverage."""
    config = BacktestConfig(
        name="Test",
        start_date=datetime(2024, 1, 1),
        end_date=datetime(2024, 12, 31),
        position_sizing=PositionSizingConfig(leverage=75),
        risk_management=RiskManagementConfig(),
    )
    warnings = get_risk_warnings(config)
    assert any("High Leverage" in warning for warning in warnings)


def test_get_risk_warnings_extreme_leverage():
    """Test risk warning for extreme leverage."""
    config = BacktestConfig(
        name="Test",
        start_date=datetime(2024, 1, 1),
        end_date=datetime(2024, 12, 31),
        position_sizing=PositionSizingConfig(leverage=150),
        risk_management=RiskManagementConfig(),
    )
    warnings = get_risk_warnings(config)
    assert any("Extreme Leverage" in warning for warning in warnings)


def test_get_risk_warnings_no_stop_loss():
    """Test risk warning for no stop loss."""
    config = BacktestConfig(
        name="Test",
        start_date=datetime(2024, 1, 1),
        end_date=datetime(2024, 12, 31),
        risk_management=RiskManagementConfig(stop_loss=StopLossConfig(type="none")),
    )
    warnings = get_risk_warnings(config)
    assert any("No Stop Loss" in warning for warning in warnings)


def test_get_risk_warnings_large_position_size():
    """Test risk warning for large position size."""
    config = BacktestConfig(
        name="Test",
        start_date=datetime(2024, 1, 1),
        end_date=datetime(2024, 12, 31),
        position_sizing=PositionSizingConfig(method="percentage", value=60),
        risk_management=RiskManagementConfig(),
    )
    warnings = get_risk_warnings(config)
    assert any("Large Position Size" in warning for warning in warnings)


def test_get_risk_warnings_high_risk_per_trade():
    """Test risk warning for high risk per trade."""
    config = BacktestConfig(
        name="Test",
        start_date=datetime(2024, 1, 1),
        end_date=datetime(2024, 12, 31),
        position_sizing=PositionSizingConfig(method="risk_based", value=7),
        risk_management=RiskManagementConfig(),
    )
    warnings = get_risk_warnings(config)
    assert any("High Risk Per Trade" in warning for warning in warnings)


def test_validate_configuration_valid():
    """Test validation of valid configuration."""
    config = BacktestConfig(
        name="Test Backtest",
        start_date=datetime(2024, 1, 1),
        end_date=datetime(2024, 12, 31),
        initial_balance=10000,
        position_sizing=PositionSizingConfig(method="percentage", value=2, leverage=1),
        risk_management=RiskManagementConfig(
            stop_loss=StopLossConfig(type="fixed_pips", value=20),
            take_profit=TakeProfitConfig(type="fixed_pips", value=40),
        ),
    )
    result = validate_configuration(config)
    assert result.valid is True
    assert len(result.errors) == 0


def test_validate_configuration_invalid_balance():
    """Test validation rejects invalid balance."""
    # Use model_construct to bypass Pydantic validation and test the validation service
    config = BacktestConfig.model_construct(
        name="Test",
        start_date=datetime(2024, 1, 1),
        end_date=datetime(2024, 12, 31),
        initial_balance=50,  # Too low
        risk_management=RiskManagementConfig(
            stop_loss=StopLossConfig(type="fixed_pips", value=20)
        ),
        position_sizing=PositionSizingConfig(),
    )
    result = validate_configuration(config)
    assert result.valid is False
    assert any("at least $100" in error for error in result.errors)


def test_validate_configuration_invalid_position_sizing():
    """Test validation rejects invalid position sizing."""
    config = BacktestConfig(
        name="Test",
        start_date=datetime(2024, 1, 1),
        end_date=datetime(2024, 12, 31),
        position_sizing=PositionSizingConfig(method="percentage", value=150),  # > 100
        risk_management=RiskManagementConfig(
            stop_loss=StopLossConfig(type="fixed_pips", value=20)
        ),
    )
    result = validate_configuration(config)
    assert result.valid is False
    assert any("between 0 and 100" in error for error in result.errors)
