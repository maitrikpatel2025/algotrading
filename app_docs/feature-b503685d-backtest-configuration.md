# Backtest Configuration System

**ADW ID:** b503685d
**Date:** 2026-01-22
**Specification:** /home/ubuntu/algotrading/trees/b503685d/specs/issue-102-adw-b503685d-sdlc_planner-backtest-configuration.md

## Overview

A comprehensive backtesting configuration system that enables traders to validate their strategies against historical market data before risking real capital. The feature introduces a new Backtest navigation item, a Backtest Library for managing saved backtests, and a Backtest Configuration page with full support for strategy selection, date ranges, position sizing, and risk management parameters.

## What Was Built

- **Navigation Update**: Added "Backtest" link between "Strategies" and "Monitor" in the navigation bar
- **Backtest Library Page**: Grid-based library for viewing, creating, deleting, and duplicating backtests with search, status filtering, and sorting
- **Backtest Configuration Page**: Comprehensive configuration form with:
  - Strategy selector with preview (pair, direction, indicator count)
  - Date range picker with presets (1m, 3m, 6m, 1y, 2y, 5y)
  - Initial account balance with currency selection (USD, EUR, GBP)
  - Position sizing options (fixed lot, fixed dollar, percentage, risk-based)
  - Risk management (stop loss, take profit, trailing stop, partial closes)
  - Visual preview chart of SL/TP levels
- **Backend API**: Full CRUD endpoints for backtest management
- **Database Schema**: Migration for backtests table with all configuration fields

## Technical Implementation

### Files Modified

- `app/client/src/App.jsx`: Added routes for `/backtests`, `/backtests/new`, `/backtests/:id/edit`
- `app/client/src/app/api.js`: Added backtest API endpoints (save, list, get, delete, duplicate)
- `app/client/src/components/NavigationBar.jsx`: Added "Backtest" navigation item
- `app/server/server.py`: Added REST endpoints for backtest CRUD operations
- `app/server/core/data_models.py`: Added Pydantic models for backtest configuration

### New Files Created

**Frontend Components:**
- `app/client/src/pages/BacktestLibrary.jsx`: Library page with grid display, search, filters, and sorting
- `app/client/src/pages/BacktestConfiguration.jsx`: Configuration form with all settings sections
- `app/client/src/components/StrategySelector.jsx`: Dropdown to select saved strategies with preview
- `app/client/src/components/DateRangePicker.jsx`: Date inputs with preset buttons and validation
- `app/client/src/components/PositionSizingForm.jsx`: Sizing method, leverage, and compound settings
- `app/client/src/components/RiskManagementForm.jsx`: Stop loss, take profit, trailing stop, partial closes
- `app/client/src/components/RiskPreviewChart.jsx`: Plotly visualization of entry, SL, and TP levels

**Backend:**
- `app/server/core/backtest_service.py`: CRUD service layer for backtests
- `app/server/db/migrations/003_create_backtests_table.sql`: Database migration
- `app/server/scripts/run_migration.py`: Migration execution script

**E2E Test:**
- `.claude/commands/e2e/test_backtest_configuration.md`: E2E test specification

### Key Changes

- **Backtest Data Models**: `PositionSizingConfig`, `StopLossConfig`, `TakeProfitConfig`, `TrailingStopConfig`, `PartialCloseConfig`, `RiskManagementConfig`, `BacktestConfig`, and `BacktestListItem` Pydantic models
- **API Endpoints**: `POST /api/backtests`, `GET /api/backtests`, `GET /api/backtests/{id}`, `DELETE /api/backtests/{id}`, `POST /api/backtests/{id}/duplicate`
- **Database Schema**: `backtests` table with foreign key to strategies, JSONB fields for position_sizing and risk_management, indexes on strategy_id and updated_at
- **Position Sizing Methods**: Fixed lot, fixed dollar, percentage (default 2%), risk-based with configurable leverage (1:1 to 1:500)
- **Risk Management Types**: Fixed pips, fixed dollar, ATR-based, percentage, risk:reward ratio for SL/TP; break-even trigger for trailing stops

## How to Use

1. Navigate to "Backtest" in the main navigation bar
2. Click "New Backtest" button in the Backtest Library
3. Enter a name for the backtest
4. Select a strategy from the dropdown (shows pair, direction, and indicator count)
5. Set the backtest date range using presets or custom dates
6. Configure initial balance and currency
7. Set position sizing method and leverage
8. Configure risk management settings (stop loss, take profit, trailing stop)
9. Review the risk preview chart showing entry and SL/TP levels
10. Click "Save Backtest" to save the configuration

### Managing Backtests

- **Search**: Filter backtests by name using the search input
- **Filter by Status**: Use All/Pending/Completed/Failed buttons
- **Sort**: Order by Last Modified, Date Created, or Name
- **Edit**: Click a backtest card to edit its configuration
- **Duplicate**: Use context menu to create a copy
- **Delete**: Use context menu with confirmation dialog

## Configuration

### Position Sizing Options

| Method | Description |
|--------|-------------|
| Fixed Lot | Trade a fixed lot size per position |
| Fixed Dollar | Trade a fixed dollar amount per position |
| Percentage | Trade a percentage of account balance (default: 2%) |
| Risk-Based | Calculate position size based on stop loss distance |

### Risk Management Options

**Stop Loss Types:**
- Fixed pips
- Fixed dollar amount
- ATR-based (multiplier)
- Percentage of entry price
- None

**Take Profit Types:**
- Fixed pips
- Fixed dollar amount
- ATR-based (multiplier)
- Percentage of entry price
- Risk:Reward ratio
- None

**Trailing Stop Types:**
- Fixed pips
- ATR-based (multiplier)
- Percentage
- Break-even trigger
- None

### Validation Rules

- Initial balance: $100 to $10,000,000
- Leverage: 1:1 to 1:500
- Date range: Minimum 1 week, maximum 10 years
- End date cannot be in the future

## Testing

Run the E2E test to validate the backtest configuration feature:

1. Read `.claude/commands/test_e2e.md` for test runner instructions
2. Execute `.claude/commands/e2e/test_backtest_configuration.md` E2E test

Manual testing:
1. Create a new backtest with various position sizing methods
2. Verify all risk management options save correctly
3. Test date range presets and custom date selection
4. Verify backtest library filtering and sorting
5. Test duplicate and delete operations

## Notes

- **Backtest Execution**: This feature covers configuration only. The actual backtest execution engine (running strategies against historical data) will be a separate feature. Status defaults to "pending" and results remain empty until execution is implemented.
- **Data Availability**: The date range data availability indicator is a placeholder. Full implementation requires integration with historical data API.
- **Strategy Deletion**: When a strategy is deleted, backtests referencing it will have a dangling reference. Consider using ON DELETE SET NULL in future iterations.
- **Future Enhancements**:
  - Backtest execution engine
  - Results visualization with equity curve
  - Trade-by-trade breakdown
  - Strategy optimization with parameter sweeps
  - Comparison of multiple backtest results
