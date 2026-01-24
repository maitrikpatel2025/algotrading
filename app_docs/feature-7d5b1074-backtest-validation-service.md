# Backtest Validation Service

**ADW ID:** 7d5b1074
**Date:** 2026-01-24
**Specification:** specs/issue-137-adw-7d5b1074-sdlc_planner-backtest-improvement-enhancements.md

## Overview

This feature implements a comprehensive validation service for backtest configurations, providing real-time feedback on configuration errors, warnings, data availability, estimated execution time, and risk warnings. It is the foundation layer (Phase 1) of the backtest system improvements, enabling users to validate their backtest configurations before execution.

## What Was Built

The implementation adds a complete backend validation service with the following components:

- **Configuration validation** - Comprehensive validation of all backtest parameters
- **Date range validation** - Checks for valid date ranges with warnings for too short (<7 days) or too long (>10 years) periods
- **Stop loss/take profit validation** - Ensures at least one risk management exit is configured
- **Data availability checking** - Verifies historical data exists for the specified currency pair, timeframe, and date range
- **Estimated duration calculation** - Estimates backtest execution time based on date range, timeframe, and strategy complexity
- **Risk warnings** - Identifies high-risk settings including excessive leverage, missing stop loss, large position sizes, and high risk per trade
- **Comprehensive test coverage** - 20 unit tests covering all validation scenarios and edge cases

## Technical Implementation

### Files Modified

- `app/server/core/backtest_validation.py`: **NEW** - Complete validation service with 349 lines of code implementing all validation functions
- `app/server/tests/test_backtest_validation.py`: **NEW** - Comprehensive test suite with 266 lines covering all validation scenarios

### Key Changes

**Validation Service Architecture**:
- Created `ValidationResult` class to encapsulate validation outcomes with errors and warnings lists
- Implemented modular validation functions that can be used independently or combined
- Integrated with existing `BacktestConfig` Pydantic models
- Added Supabase database integration to verify strategy existence

**Core Validation Functions**:
1. `validate_configuration()` - Main entry point performing comprehensive config validation
2. `validate_date_range()` - Validates date range logic with future date detection and duration warnings
3. `validate_sl_tp_configuration()` - Ensures at least one exit rule (SL or TP) is configured
4. `check_data_availability()` - Checks if historical data is available for the specified parameters
5. `calculate_estimated_duration()` - Estimates execution time based on candle count and strategy complexity
6. `get_risk_warnings()` - Identifies and warns about high-risk configuration settings

**Validation Rules Implemented**:
- Date validation: End date must be after start date, no future dates allowed
- Date range warnings: < 7 days triggers "too short" warning, > 10 years triggers "too long" warning
- Balance validation: Minimum $100, maximum $10,000,000
- Position sizing: Percentage and risk-based methods must be between 0-100%
- Leverage warnings: > 50:1 triggers high leverage warning, > 100:1 triggers extreme leverage warning
- Risk management: At least one of stop loss or take profit must be configured (not both "none")
- Strategy validation: Checks database to ensure strategy_id exists

**Risk Warning Categories**:
- ⚠️ High Leverage (>50:1) and Extreme Leverage (>100:1)
- ⚠️ No Stop Loss - unlimited downside risk
- ⚠️ No Take Profit - consider profit targets
- ⚠️ Large Position Size (>50% of account per trade)
- ⚠️ High Risk Per Trade (>5% per trade)
- 💡 Compounding Disabled with small balance

**Data Availability Check**:
- Validates pair and timeframe are provided
- Checks dates are not in the future
- Warns if data may be limited (>10 years ago)
- Provides availability status for common currency pairs (EUR_USD, GBP_USD, USD_JPY, etc.)

**Estimated Duration Calculation**:
- Maps timeframes to candle counts (M1=1min, M5=5min, H1=60min, H4=240min, D=1440min)
- Applies complexity multiplier (simple=0.001s, medium=0.005s, complex=0.01s per candle)
- Adds 5 second base overhead for setup/teardown
- Returns minimum 6 seconds to avoid edge cases

## How to Use

### Backend Integration

Import and use the validation functions in your backend code:

```python
from core.backtest_validation import (
    validate_configuration,
    check_data_availability,
    calculate_estimated_duration,
    get_risk_warnings
)

# Validate entire configuration
result = validate_configuration(backtest_config)
if not result.valid:
    print(f"Errors: {result.errors}")
    print(f"Warnings: {result.warnings}")

# Check data availability
available, message, gaps = check_data_availability(
    pair="EUR_USD",
    timeframe="H1",
    start_date=datetime(2024, 1, 1),
    end_date=datetime(2024, 12, 31)
)

# Calculate estimated duration
duration_seconds = calculate_estimated_duration(
    pair="EUR_USD",
    timeframe="H1",
    start_date=datetime(2024, 1, 1),
    end_date=datetime(2024, 12, 31),
    strategy_complexity="medium"
)

# Get risk warnings
warnings = get_risk_warnings(backtest_config)
for warning in warnings:
    print(warning)
```

### API Endpoint Integration (Future)

The validation service is designed to support a future API endpoint:

```
POST /api/backtests/validate
{
  "name": "My Strategy",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z",
  "initial_balance": 10000,
  "pair": "EUR_USD",
  "timeframe": "H1",
  "position_sizing": {
    "method": "percentage",
    "value": 2,
    "leverage": 50
  },
  "risk_management": {
    "stop_loss": { "type": "fixed_pips", "value": 20 },
    "take_profit": { "type": "fixed_pips", "value": 40 }
  }
}

Response:
{
  "valid": true,
  "errors": [],
  "warnings": ["High leverage (50:1) increases risk significantly"],
  "data_available": true,
  "data_message": "Historical data is available for the selected period",
  "estimated_duration": 9,
  "risk_warnings": [
    "⚠️ High Leverage: Using 50:1 leverage significantly increases both potential profits and losses"
  ]
}
```

## Configuration

No configuration required. The validation service uses these default thresholds:

- **Minimum balance**: $100
- **Maximum balance**: $10,000,000
- **Short date range threshold**: 7 days
- **Long date range threshold**: 10 years (3,650 days)
- **High leverage threshold**: 50:1
- **Extreme leverage threshold**: 100:1
- **Large position size threshold**: 50% of account
- **High risk per trade threshold**: 5% per trade
- **Historical data availability**: Last 10 years

These thresholds are hardcoded in `backtest_validation.py` and can be modified if needed.

## Testing

### Running Unit Tests

```bash
cd app/server
uv run pytest tests/test_backtest_validation.py -v
```

### Test Coverage

The test suite includes 20 comprehensive tests covering:

1. **Date Range Validation** (5 tests):
   - Valid date range
   - Reversed dates (end before start)
   - Future dates rejection
   - Too short range warning (<7 days)
   - Too long range warning (>10 years)

2. **Stop Loss/Take Profit Validation** (4 tests):
   - Both none (should fail)
   - Only SL set (should pass)
   - Only TP set (should pass)
   - Invalid values (negative/zero)

3. **Data Availability** (3 tests):
   - Common currency pair (should be available)
   - Future dates (should fail)
   - Missing pair/timeframe (should fail)

4. **Estimated Duration** (1 test):
   - Calculation accuracy for 7-day H1 backtest

5. **Risk Warnings** (6 tests):
   - High leverage (>50:1)
   - Extreme leverage (>100:1)
   - No stop loss
   - Large position size (>50%)
   - High risk per trade (>5%)

6. **Full Configuration Validation** (3 tests):
   - Valid configuration
   - Invalid balance
   - Invalid position sizing

### Edge Cases Tested

- Date range exactly at warning thresholds (7 days, 10 years)
- Leverage exactly at warning thresholds (50:1, 100:1)
- Position sizing at boundaries (0%, 100%)
- Strategy existence validation with database integration
- Risk percentage validation for different position sizing methods

## Notes

### Integration with Backtest System

This validation service is the foundation (Phase 1) for the larger backtest improvement feature. It provides:

1. **Backend validation layer** - Can be used by API endpoints before saving/executing backtests
2. **Real-time validation support** - Designed to support frontend real-time validation via API calls
3. **User-friendly feedback** - Returns both technical errors and user-friendly warnings
4. **Risk awareness** - Proactively warns users about high-risk configurations

### Future Enhancements (Phase 2-3)

The following enhancements are planned as part of the larger backtest improvement feature:

- **Frontend Integration**: Create API endpoint and connect to configuration dialog for real-time validation
- **Validation Summary Panel**: Display validation results, data availability, and estimated duration in UI
- **Risk Warning UI**: Show risk warnings prominently in configuration dialog
- **Tooltip System**: Add explanatory tooltips for all technical fields
- **Preset Templates**: Create conservative/moderate/aggressive presets that pass all validations

### Validation Philosophy

The validation service follows these principles:

1. **Fail-fast for errors**: Block execution for configuration errors that will cause failures
2. **Warn for risks**: Provide warnings for valid but risky configurations (users can still proceed)
3. **Educate users**: Use descriptive messages that explain why something is invalid or risky
4. **Separate concerns**: Modular functions allow selective validation where needed
5. **Testable**: Comprehensive test coverage ensures validation logic is correct

### Known Limitations

- **Data availability check is simplified**: Currently checks against a list of common pairs and date ranges. A full implementation would query the data provider API to verify actual data availability
- **No missing data gap detection**: The service doesn't detect specific gaps in historical data (e.g., missing weeks or months)
- **Estimated duration is approximate**: Based on simple heuristics. Actual execution time may vary based on strategy complexity, system load, and data source performance
- **Strategy validation requires database**: If Supabase is not configured, strategy existence validation is skipped with a warning

### Database Integration

The validation service integrates with the Supabase database to verify:
- Strategy existence when `strategy_id` is provided in the configuration
- This helps catch issues early if a user tries to run a backtest with a deleted or invalid strategy

If the database is not configured, validation will skip the strategy check and add a warning to the warnings list.

