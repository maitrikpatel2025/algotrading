# Feature: Backtest Configuration System (US-BT-001 to US-BT-005)

## Metadata
issue_number: `102`
adw_id: `b503685d`
issue_json: `{"number":102,"title":"Feature Backtest Configuration US-BT-001 -US-BT-005","body":"..."}`

## Feature Description
Add a comprehensive backtesting system to the Algotrading application, allowing users to test their saved strategies against historical market data. This feature introduces a new "Backtest" navigation item, a Backtest Library for managing saved backtests, and a Backtest Configuration page where users can configure all aspects of a backtest including strategy selection, date range, initial balance, position sizing, and risk management parameters.

The backtesting system will enable traders to validate their strategies before deploying them in live trading, providing insights into historical performance including win rate, profit/loss, and other key metrics.

## User Story
As a trader
I want to configure and run backtests on my saved strategies against historical market data
So that I can evaluate strategy performance before risking real capital

## Problem Statement
Traders currently have no way to validate their strategies against historical data before deploying them in live trading. This forces them to either paper trade (which is slow) or risk real capital on unproven strategies. A comprehensive backtesting system with configurable parameters for position sizing, risk management, and date ranges would allow traders to gain confidence in their strategies and optimize parameters before going live.

## Solution Statement
Implement a full backtesting subsystem consisting of:
1. **Navigation Update**: Add "Backtest" link between "Strategies" and "Monitor" in the navigation bar
2. **Backtest Library**: A page similar to Strategy Library where users can view, create, delete, and duplicate backtests
3. **Backtest Configuration**: A comprehensive configuration page with:
   - Strategy selector with preview
   - Date range picker with presets and validation
   - Initial account balance with currency selection
   - Position sizing options (fixed lot, fixed dollar, percentage, risk-based)
   - Risk management (stop loss, take profit, trailing stop, partial closes)
   - Visual preview of SL/TP levels

## Relevant Files
Use these files to implement the feature:

### Server (Backend)
- `app/server/server.py` - Main FastAPI server; add new `/api/backtests/*` endpoints following the strategy endpoint patterns (lines 1-200 for endpoint structure)
- `app/server/core/data_models.py` - Pydantic models; add BacktestConfig, BacktestListItem, and related request/response models (follow StrategyConfig pattern at lines 381-544)
- `app/server/core/strategy_service.py` - Service layer pattern; create similar `backtest_service.py` following this CRUD pattern (lines 157-291 for save/get/list/delete)
- `app/server/db/supabase_client.py` - Database connection; use existing patterns for backtest persistence
- `app/server/db/migrations/002_create_strategies_table.sql` - SQL migration pattern; create `003_create_backtests_table.sql`

### Client (Frontend)
- `app/client/src/App.jsx` - Routing; add `/backtests`, `/backtests/new`, `/backtests/:id/edit` routes (lines 33-52)
- `app/client/src/components/NavigationBar.jsx` - Add "Backtest" nav item at line 15 between Strategies and Monitor
- `app/client/src/pages/StrategyLibrary.jsx` - Template for BacktestLibrary.jsx; follow same patterns for grid, cards, search, filter, dialogs
- `app/client/src/app/api.js` - API client; add backtest endpoints following the strategy endpoint patterns
- `app/client/src/components/Select.jsx` - Reusable select component for strategy selector, currency, and sizing method
- `app/client/src/components/ui/Input.jsx` - Reusable input component for numeric inputs
- `app/client/src/components/ui/Card.jsx` - Card components for configuration sections
- `app/client/src/components/ConfirmDialog.jsx` - Confirmation dialogs for delete/duplicate actions
- `app/client/src/components/Toast.jsx` - Toast notifications for success/error feedback

### Documentation
- `.claude/commands/test_e2e.md` - E2E test runner instructions
- `.claude/commands/e2e/test_strategy_library.md` - Template for backtest library E2E test

### New Files
The following new files need to be created:

**Server:**
- `app/server/core/backtest_service.py` - CRUD service layer for backtests
- `app/server/db/migrations/003_create_backtests_table.sql` - Database migration for backtests table

**Client:**
- `app/client/src/pages/BacktestLibrary.jsx` - Library page for listing/managing backtests
- `app/client/src/pages/BacktestConfiguration.jsx` - Configuration page for creating/editing backtests
- `app/client/src/components/StrategySelector.jsx` - Dropdown component for selecting saved strategies
- `app/client/src/components/DateRangePicker.jsx` - Date range picker with presets
- `app/client/src/components/PositionSizingForm.jsx` - Position sizing configuration form
- `app/client/src/components/RiskManagementForm.jsx` - Risk management configuration form
- `app/client/src/components/RiskPreviewChart.jsx` - Visual preview of SL/TP levels

**E2E Test:**
- `.claude/commands/e2e/test_backtest_configuration.md` - E2E test specification

## Implementation Plan

### Phase 1: Foundation
1. Create database migration for backtests table with all required fields
2. Create Pydantic data models for BacktestConfig and related types
3. Create backtest_service.py with CRUD operations
4. Add API endpoints in server.py for backtests

### Phase 2: Core Implementation
1. Update NavigationBar to add "Backtest" link
2. Create BacktestLibrary page following StrategyLibrary pattern
3. Create BacktestConfiguration page with all form sections:
   - Strategy selector with preview
   - Date range picker with presets
   - Initial balance input with currency
   - Position sizing configuration
   - Risk management settings
4. Create supporting components (StrategySelector, DateRangePicker, etc.)

### Phase 3: Integration
1. Add routes in App.jsx for backtest pages
2. Add API client methods in api.js
3. Wire up form submission and validation
4. Add toast notifications for user feedback
5. Create E2E test specification

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Task 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_strategy_library.md` to understand E2E test structure
- Create `.claude/commands/e2e/test_backtest_configuration.md` with test steps for:
  - Navigate to Backtest Library
  - Verify empty state or existing backtests
  - Create new backtest
  - Configure strategy selection
  - Set date range with presets
  - Configure initial balance
  - Set position sizing options
  - Configure risk management
  - Save backtest
  - Verify backtest appears in library

### Task 2: Create Database Migration
- Create `app/server/db/migrations/003_create_backtests_table.sql`
- Include all configuration fields:
  - `id` (UUID, primary key)
  - `name` (VARCHAR 100)
  - `description` (TEXT)
  - `strategy_id` (UUID, foreign key to strategies)
  - `pair` (VARCHAR 20)
  - `timeframe` (VARCHAR 10)
  - `start_date` (TIMESTAMP)
  - `end_date` (TIMESTAMP)
  - `initial_balance` (DECIMAL 12,2)
  - `currency` (VARCHAR 3)
  - `position_sizing` (JSONB) - sizing method, leverage, max position, compound toggle
  - `risk_management` (JSONB) - stop loss, take profit, trailing stop, partial closes
  - `status` (VARCHAR 20)
  - `results` (JSONB)
  - `created_at`, `updated_at` (TIMESTAMP)
- Add indexes on strategy_id, updated_at
- Add trigger for updated_at auto-update

### Task 3: Create Backend Data Models
- Add to `app/server/core/data_models.py`:
  - `PositionSizingConfig` model with sizing method, leverage, max position, compound
  - `StopLossConfig` model with type, value
  - `TakeProfitConfig` model with type, value
  - `TrailingStopConfig` model with type, value, break_even_trigger
  - `PartialCloseConfig` model with levels and percentages
  - `RiskManagementConfig` model combining SL/TP/trailing/partials
  - `BacktestConfig` model with all fields
  - `BacktestListItem` model for library display
  - Request/Response models: SaveBacktestRequest, SaveBacktestResponse, ListBacktestsResponse, LoadBacktestResponse, DeleteBacktestResponse

### Task 4: Create Backtest Service Layer
- Create `app/server/core/backtest_service.py`
- Implement functions following strategy_service.py patterns:
  - `save_backtest(backtest: BacktestConfig)` - Save/update backtest
  - `get_backtest(backtest_id: str)` - Get backtest by ID
  - `list_backtests()` - List all backtests with strategy names
  - `delete_backtest(backtest_id: str)` - Delete backtest
  - `duplicate_backtest(backtest_id: str)` - Duplicate backtest
  - `_backtest_to_db_row(backtest)` - Convert to DB format
  - `_db_row_to_backtest(row)` - Convert from DB format

### Task 5: Add API Endpoints
- Add to `app/server/server.py`:
  - `POST /api/backtests` - Save backtest
  - `GET /api/backtests` - List backtests
  - `GET /api/backtests/{id}` - Get backtest by ID
  - `DELETE /api/backtests/{id}` - Delete backtest
  - `POST /api/backtests/{id}/duplicate` - Duplicate backtest
- Follow the strategy endpoint patterns for error handling and logging

### Task 6: Update Navigation Bar
- Edit `app/client/src/components/NavigationBar.jsx`
- Add "Backtest" item to navItems array at line 15:
  ```javascript
  const navItems = [
    { href: '/strategies', label: 'Strategies' },
    { href: '/backtests', label: 'Backtest' },
    { href: '/monitor', label: 'Monitor' },
    { href: '/account', label: 'Account' },
  ];
  ```
- Update active state detection to handle `/backtests*` routes

### Task 7: Add API Client Methods
- Edit `app/client/src/app/api.js`
- Add backtest endpoints to endPoints object:
  - `saveBacktest: (backtest) => requests.post("/backtests", { backtest })`
  - `listBacktests: () => requests.get("/backtests")`
  - `getBacktest: (id) => requests.get(\`/backtests/${id}\`)`
  - `deleteBacktest: (id) => requests.delete(\`/backtests/${id}\`)`
  - `duplicateBacktest: (id) => requests.post(\`/backtests/${id}/duplicate\`)`

### Task 8: Create Strategy Selector Component
- Create `app/client/src/components/StrategySelector.jsx`
- Features:
  - Fetch strategies from API on mount
  - Dropdown with strategy names
  - Show selected strategy preview (pair, direction, indicator count, condition count)
  - Handle loading and error states
  - Call `endPoints.listStrategiesExtended()` for strategy data

### Task 9: Create Date Range Picker Component
- Create `app/client/src/components/DateRangePicker.jsx`
- Features:
  - Start date and end date inputs (type="date")
  - Preset buttons: 1 month, 3 months, 6 months, 1 year, 2 years, 5 years
  - Validation: end date cannot be future, min range 1 week, max range 10 years
  - Data availability indicator (placeholder for now)
  - Gap warning display (placeholder for now)

### Task 10: Create Position Sizing Form Component
- Create `app/client/src/components/PositionSizingForm.jsx`
- Features:
  - Sizing method selector: Fixed lot, Fixed dollar, Percentage (default), Risk-based
  - Value input based on selected method
  - Leverage selector: 1:1 to 1:500
  - Maximum position size cap input
  - Compound toggle: Reinvest profits vs Fixed base

### Task 11: Create Risk Management Form Component
- Create `app/client/src/components/RiskManagementForm.jsx`
- Features:
  - Stop Loss section:
    - Type selector: Fixed pips, Fixed dollar, ATR-based, Percentage, None
    - Value input based on type
  - Take Profit section:
    - Type selector: Fixed pips, Fixed dollar, ATR-based, Percentage, Risk:Reward ratio, None
    - Value input based on type
  - Trailing Stop section:
    - Type selector: Fixed pips, ATR-based, Percentage, Break-even trigger, None
    - Value input based on type
  - Partial Closes section:
    - Toggle to enable/disable
    - Multiple TP levels with percentage inputs

### Task 12: Create Risk Preview Chart Component
- Create `app/client/src/components/RiskPreviewChart.jsx`
- Features:
  - Simple visual showing entry price, stop loss, and take profit levels
  - Update dynamically based on risk management settings
  - Use Plotly.js for simple line/annotation chart
  - Show relative distances from entry

### Task 13: Create Backtest Configuration Page
- Create `app/client/src/pages/BacktestConfiguration.jsx`
- Layout:
  - Page header with title "Configure Backtest" and Save/Cancel buttons
  - Name and description inputs at top
  - Grid layout with sections:
    - Left column: Strategy Selector, Date Range Picker
    - Right column: Initial Balance (with currency), Position Sizing
    - Full width: Risk Management, Risk Preview Chart
- State management:
  - Form state for all configuration fields
  - Loading states for API calls
  - Validation errors display
- On save: Call API to save backtest, navigate to library on success

### Task 14: Create Backtest Library Page
- Create `app/client/src/pages/BacktestLibrary.jsx`
- Follow StrategyLibrary.jsx pattern exactly:
  - Page header with "Backtests" title and "New Backtest" button
  - Search input for filtering by name
  - Status filter buttons: All, Pending, Completed, Failed
  - Sort dropdown: Last Modified, Date Created, Name
  - Grid of backtest cards showing:
    - Name, strategy name, pair
    - Date range
    - Initial balance
    - Status badge (pending/completed/failed)
    - Results summary if completed (win rate, P/L)
    - Context menu: Edit, Duplicate, Delete
  - Empty state with "Create Backtest" CTA
  - Toast notifications for actions
  - Confirm dialog for delete

### Task 15: Add Routes to App.jsx
- Edit `app/client/src/App.jsx`
- Import new pages: BacktestLibrary, BacktestConfiguration
- Add routes after strategy routes:
  ```jsx
  {/* Backtests - Library and Configuration */}
  <Route path="/backtests" element={<BacktestLibrary />} />
  <Route path="/backtests/new" element={<BacktestConfiguration />} />
  <Route path="/backtests/:id/edit" element={<BacktestConfiguration />} />
  ```
- Hide footer on configuration pages (add to isBuilderPage check)

### Task 16: Run Validation Commands
- Execute all validation commands to ensure zero regressions:
  - Server tests
  - Client build
  - E2E test for backtest configuration

## Testing Strategy

### Unit Tests
- Test backtest_service.py CRUD operations:
  - test_save_backtest_new
  - test_save_backtest_update
  - test_get_backtest_found
  - test_get_backtest_not_found
  - test_list_backtests_empty
  - test_list_backtests_with_data
  - test_delete_backtest
  - test_duplicate_backtest
- Test data model validation:
  - test_backtest_config_validation
  - test_position_sizing_config_validation
  - test_risk_management_config_validation
  - test_date_range_validation

### Edge Cases
- Strategy ID references deleted strategy
- Date range validation (end before start, future end date)
- Initial balance at boundaries (min $100, max $10,000,000)
- Position sizing at extremes (0.01 lots, 100% of balance)
- Leverage limits (1:1 to 1:500)
- Risk:Reward ratios (1:0.5 to 1:10)
- Partial close percentages must sum to <= 100%
- Name conflicts on duplicate
- Large number of backtests in library (pagination consideration)

## Acceptance Criteria
- [ ] "Backtest" navigation link appears between "Strategies" and "Monitor"
- [ ] Backtest Library page loads and displays backtests in a card grid
- [ ] Search filters backtests by name
- [ ] Status filter works for All/Pending/Completed/Failed
- [ ] Sort changes backtest order
- [ ] New Backtest button navigates to configuration page
- [ ] Strategy selector shows all saved strategies with preview
- [ ] Date range picker has all presets (1m, 3m, 6m, 1y, 2y, 5y)
- [ ] Date range validation prevents invalid ranges
- [ ] Initial balance accepts values between $100 and $10,000,000
- [ ] Currency selector offers USD, EUR, GBP
- [ ] Position sizing supports all four methods
- [ ] Leverage selector ranges from 1:1 to 1:500
- [ ] Compound toggle works correctly
- [ ] All stop loss types are configurable
- [ ] All take profit types are configurable
- [ ] Trailing stop options are configurable
- [ ] Partial closes can be configured with multiple levels
- [ ] Risk preview chart updates based on settings
- [ ] Save creates new backtest in database
- [ ] Edit loads existing backtest data
- [ ] Duplicate creates copy with unique name
- [ ] Delete removes backtest with confirmation
- [ ] Toast notifications show for all actions
- [ ] All server tests pass
- [ ] Client build succeeds without errors
- [ ] E2E test passes

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_backtest_configuration.md` E2E test to validate this functionality works

## Notes
- **Backtest Execution**: This plan covers configuration only (US-BT-001 to US-BT-005). The actual backtest execution engine (running strategies against historical data, calculating results) will be a separate feature. The `status` field defaults to "pending" and `results` field remains empty until the execution feature is implemented.
- **Data Availability**: The date range data availability indicator and gap warnings are placeholders. Full implementation requires integration with historical data API to check actual data coverage.
- **Visual Preview**: The risk preview chart is a simplified visualization. Advanced features like multiple take profit levels on the chart can be enhanced in future iterations.
- **Database Migration**: Run the migration manually in Supabase dashboard or via migration script. The migration creates the backtests table with foreign key to strategies.
- **Strategy Deletion Impact**: When a strategy is deleted, backtests referencing it will have a dangling reference. Consider adding ON DELETE SET NULL or keeping strategy snapshot in backtest config.
- **Future Enhancements**:
  - Backtest execution engine
  - Results visualization with equity curve
  - Trade-by-trade breakdown
  - Strategy optimization with parameter sweeps
  - Comparison of multiple backtest results
