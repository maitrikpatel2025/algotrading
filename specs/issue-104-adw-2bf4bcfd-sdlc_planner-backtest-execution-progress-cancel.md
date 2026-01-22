# Feature: Backtest Execution Progress & Cancel

## Metadata
issue_number: `104`
adw_id: `2bf4bcfd`
issue_json: `{"number":104,"title":"Feature Backtest Execution US-BT-006 US-BT-007","body":"/feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n\n\nBacktest Execution\n Run Backtest\n\nI want to execute the backtest and see a progress indicator\nSo that I know the test is running and how long it will take\nAcceptance Criteria:\n\n \"Run Backtest\" button initiates backtest\n Validation checks strategy has at least one entry condition\n Progress bar shows percentage complete\n Estimated time remaining displayed\n Current date being processed shown\n Trade count incrementing in real-time\n Background execution (UI remains responsive)\n\n\n\nCancel Running Backtest\n\nI want to cancel a running backtest\nSo that I can stop a test that's taking too long or adjust parameters\nAcceptance Criteria:\n\n \"Cancel\" button visible during backtest execution\n Confirmation prompt: \"Cancel backtest? Partial results will be discarded.\"\n Cancellation stops processing within 2 seconds\n UI returns to configuration state\n Option to \"Cancel and Keep Partial Results\" for very long backtests\n\nStory Points: 2\nPriority: P1 - High\nDependencies: US-BT-006\nBuild Order: 38"}`

## Feature Description
This feature implements backtest execution with real-time progress tracking and cancellation capabilities. Users will be able to run backtests on their configured strategies against historical market data, monitor execution progress with detailed metrics (percentage complete, estimated time remaining, current date processed, trade count), and cancel running backtests when needed. The execution happens in the background, keeping the UI responsive throughout the process.

## User Story
As a trader
I want to execute a backtest and see real-time progress, with the ability to cancel if needed
So that I can validate my trading strategies against historical data while maintaining control over long-running operations

## Problem Statement
Currently, the backtest configuration system allows users to create and save backtest configurations, but there is no way to actually execute them. Users cannot:
- Run a backtest against historical data
- Monitor execution progress in real-time
- Know how long a backtest will take
- Cancel a running backtest if it takes too long or they want to adjust parameters

Without execution capabilities, the backtest configuration feature provides no actual value for strategy validation.

## Solution Statement
Implement a complete backtest execution system with:

1. **Run Backtest Button** - Initiates backtest execution from the BacktestConfiguration page
2. **Strategy Validation** - Ensures the linked strategy has at least one entry condition before execution
3. **Background Execution** - Uses threading/asyncio for non-blocking execution
4. **Real-time Progress Tracking** - Progress bar, percentage, estimated time remaining, current date, trade count
5. **Polling-based Updates** - Frontend polls backend every 1-2 seconds for progress updates
6. **Cancel Mechanism** - Stop button with confirmation dialog, graceful termination within 2 seconds
7. **Partial Results Option** - Allow keeping partial results for very long backtests

## Relevant Files
Use these files to implement the feature:

### Backend Files
- `app/server/server.py` - Add new API endpoints for run, progress, and cancel operations (lines 1210-1416 contain existing backtest routes)
- `app/server/core/backtest_service.py` - Existing CRUD service, will add execution orchestration methods
- `app/server/core/data_models.py` - Add new Pydantic models for execution progress and control (lines 550-706 contain existing backtest models)
- `app/server/core/bot_controller.py` - Reference pattern for background process management with subprocess and threading
- `app/server/core/bot_status.py` - Reference pattern for status tracking with singleton pattern
- `app/server/db/migrations/003_create_backtests_table.sql` - Reference for schema; will need migration for progress fields

### Frontend Files
- `app/client/src/pages/BacktestConfiguration.jsx` - Add Run button, progress modal, cancel functionality
- `app/client/src/pages/BacktestLibrary.jsx` - Update to show running status with progress badge
- `app/client/src/components/Progress.jsx` - Existing generic progress bar component for reference
- `app/client/src/app/api.js` - Add API client methods for run, progress, and cancel endpoints

### Test Files
- `.claude/commands/test_e2e.md` - E2E test runner instructions
- `.claude/commands/e2e/test_backtest_configuration.md` - Existing E2E test to extend with execution tests

### Documentation
- `app_docs/feature-b503685d-backtest-configuration.md` - Existing backtest configuration documentation

### New Files
- `app/server/core/backtest_executor.py` - New backtest execution engine with progress tracking
- `app/server/db/migrations/004_add_backtest_progress_fields.sql` - Database migration for progress tracking fields
- `app/client/src/components/BacktestProgressModal.jsx` - New modal component for execution progress display
- `.claude/commands/e2e/test_backtest_execution.md` - New E2E test file for backtest execution functionality

## Implementation Plan
### Phase 1: Foundation
- Create database migration to add progress tracking fields to backtests table
- Define new Pydantic models for backtest progress, run request/response, and cancel response
- Create BacktestExecutor class following BotController pattern for background execution management

### Phase 2: Core Implementation
- Implement backtest execution engine with candle iteration, condition evaluation, and trade simulation
- Add progress tracking with percentage, current date, trade count, and estimated time remaining
- Implement API endpoints for run, progress polling, and cancel operations
- Add graceful cancellation mechanism with threading events

### Phase 3: Integration
- Update BacktestConfiguration page with Run button and validation
- Create BacktestProgressModal component for real-time progress display
- Implement polling mechanism for progress updates
- Add cancel functionality with confirmation dialogs
- Update BacktestLibrary to show running backtests with progress badges

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Task 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` to understand E2E test format
- Read `.claude/commands/e2e/test_backtest_configuration.md` for reference
- Create `.claude/commands/e2e/test_backtest_execution.md` with test steps for:
  - Run button visibility and validation
  - Progress modal display with percentage, time remaining, current date, trade count
  - Cancel button and confirmation dialog
  - Cancel and Keep Partial Results option
  - Backtest completion flow

### Task 2: Database Schema Update
- Create `app/server/db/migrations/004_add_backtest_progress_fields.sql`:
  - Add `progress_percentage` (integer, default 0)
  - Add `current_date_processed` (timestamp, nullable)
  - Add `total_candles` (integer, nullable)
  - Add `candles_processed` (integer, default 0)
  - Add `trade_count` (integer, default 0)
  - Add `started_at` (timestamp, nullable) - execution start time
  - Add `completed_at` (timestamp, nullable) - execution end time
  - Add `error_message` (text, nullable)
  - Add `partial_results` (jsonb, nullable) - for cancel with partial results
- Run migration against development database

### Task 3: Define New Data Models
- Add to `app/server/core/data_models.py`:
  - `BacktestProgress` model with progress_percentage, current_date, candles_processed, total_candles, trade_count, estimated_seconds_remaining, status, error_message
  - `RunBacktestRequest` model with backtest_id, keep_partial_on_cancel (boolean)
  - `RunBacktestResponse` model with success, message, error
  - `BacktestProgressResponse` model wrapping BacktestProgress
  - `CancelBacktestRequest` model with keep_partial_results (boolean)
  - `CancelBacktestResponse` model with success, message, partial_results_saved

### Task 4: Create Backtest Executor Service
- Create `app/server/core/backtest_executor.py`:
  - `BacktestExecutor` class following BotController singleton pattern
  - `_running_backtests: Dict[str, BacktestExecution]` to track active executions
  - `start_backtest(backtest_id)` method to begin execution in background thread
  - `get_progress(backtest_id)` method to return current progress
  - `cancel_backtest(backtest_id, keep_partial)` method to stop execution
  - `_execute_backtest(backtest_id, cancel_event)` internal method for execution loop
  - Progress tracking with: current candle index, total candles, trade count, start time
  - Estimated time calculation based on elapsed time and progress percentage
  - `threading.Event` for cancellation signaling
  - Proper cleanup on completion/cancellation

### Task 5: Implement Strategy Validation
- Add to `app/server/core/backtest_executor.py`:
  - `validate_strategy_for_execution(strategy_id)` method
  - Check strategy exists in database
  - Check strategy has at least one entry condition (long_entry or short_entry)
  - Return validation result with error messages if invalid

### Task 6: Implement Backtest Execution Logic
- In `app/server/core/backtest_executor.py`:
  - Fetch historical price data for the configured date range and pair
  - Iterate through candles chronologically
  - Evaluate entry/exit conditions against each candle
  - Simulate trades based on position sizing and risk management settings
  - Track trade count, P/L, and other metrics
  - Update progress in database periodically (every 1% or every 100 candles)
  - Check cancellation event between candle iterations
  - On completion, update status to "completed" and store results
  - On error, update status to "failed" and store error message
  - On cancellation, update status to "pending" or save partial results

### Task 7: Add Backend API Endpoints
- Add to `app/server/server.py`:
  - `POST /api/backtests/{id}/run` - Start backtest execution
    - Validate backtest exists
    - Validate linked strategy has entry conditions
    - Call BacktestExecutor.start_backtest()
    - Return immediately with success/error status
  - `GET /api/backtests/{id}/progress` - Get current progress
    - Return BacktestProgressResponse with all progress fields
    - Include status, percentage, current date, trade count, ETA
  - `POST /api/backtests/{id}/cancel` - Cancel running backtest
    - Accept keep_partial_results in request body
    - Call BacktestExecutor.cancel_backtest()
    - Return success/error with partial results status

### Task 8: Update Backend Service Layer
- Update `app/server/core/backtest_service.py`:
  - Add `update_backtest_progress(backtest_id, progress)` function
  - Add `update_backtest_status(backtest_id, status, results, error)` function
  - Add `save_partial_results(backtest_id, partial_results)` function
  - Import and use these in BacktestExecutor

### Task 9: Add Frontend API Client Methods
- Update `app/client/src/app/api.js`:
  - Add `runBacktest(backtestId)` function - POST to /api/backtests/{id}/run
  - Add `getBacktestProgress(backtestId)` function - GET /api/backtests/{id}/progress
  - Add `cancelBacktest(backtestId, keepPartial)` function - POST to /api/backtests/{id}/cancel

### Task 10: Create BacktestProgressModal Component
- Create `app/client/src/components/BacktestProgressModal.jsx`:
  - Modal overlay with progress display
  - Circular or linear progress bar showing percentage
  - Current status text (Running, Completing, Cancelling)
  - Current date being processed
  - Trade count with real-time increment display
  - Estimated time remaining (formatted as "~Xm Ys" or "~Xh Ym")
  - Candles processed / Total candles display
  - Cancel button with red styling
  - "Cancel and Keep Partial Results" option (checkbox or secondary button)
  - Animation states for smooth transitions

### Task 11: Update BacktestConfiguration Page
- Update `app/client/src/pages/BacktestConfiguration.jsx`:
  - Add "Run Backtest" button next to Save button (disabled when saving/running)
  - Add state for: isRunning, showProgressModal, backtestProgress
  - Implement `handleRunBacktest()`:
    - Call runBacktest API
    - Show error toast if validation fails
    - Open progress modal if successful
  - Implement polling with `useEffect` and `setInterval` (every 1500ms when running)
  - Implement `handleCancelBacktest(keepPartial)`:
    - Show confirmation dialog: "Cancel backtest? Partial results will be discarded."
    - If keepPartial, show different message about preserving partial results
    - Call cancelBacktest API
    - Close progress modal, update UI
  - Handle completion: close modal, show success toast, optionally navigate to results
  - Handle error: close modal, show error toast with message

### Task 12: Add Confirmation Dialogs
- Add cancel confirmation dialog to BacktestConfiguration:
  - Title: "Cancel Running Backtest?"
  - Body: "Cancel backtest? Partial results will be discarded."
  - Buttons: "Continue Running" (secondary), "Cancel Backtest" (danger)
  - Checkbox or link: "Cancel and Keep Partial Results"

### Task 13: Update BacktestLibrary for Running Status
- Update `app/client/src/pages/BacktestLibrary.jsx`:
  - Show animated progress indicator on cards with status "running"
  - Display progress percentage in badge
  - Add "View Progress" quick action for running backtests
  - Clicking running backtest card navigates to configuration with progress modal open

### Task 14: Add Unit Tests for Backend
- Create `app/server/tests/test_backtest_executor.py`:
  - Test BacktestExecutor singleton pattern
  - Test start_backtest with valid backtest
  - Test start_backtest with invalid/missing strategy
  - Test strategy validation (entry conditions check)
  - Test get_progress returns correct data
  - Test cancel_backtest stops execution within 2 seconds
  - Test partial results saving on cancel
  - Test concurrent execution handling
  - Mock database and historical data fetching

### Task 15: Validation and Testing
- Run backend tests: `cd app/server && uv run pytest`
- Run frontend build: `cd app/client && npm run build`
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_backtest_execution.md`

## Testing Strategy
### Unit Tests
- `test_backtest_executor.py`: BacktestExecutor class methods (start, progress, cancel)
- Test strategy validation logic (entry condition checking)
- Test progress calculation (percentage, ETA)
- Test cancellation signal handling
- Test partial results saving
- Test database updates during execution

### Edge Cases
- Strategy with no entry conditions (should fail validation)
- Backtest with no linked strategy (should fail validation)
- Cancelling immediately after starting (within first second)
- Cancelling near completion (99% progress)
- Very short date range (few candles)
- Very long date range (thousands of candles)
- Database connection loss during execution
- Concurrent run requests for same backtest
- Running multiple backtests simultaneously

## Acceptance Criteria
- [x] Existing backtest configuration functionality preserved
- [ ] "Run Backtest" button visible on BacktestConfiguration page
- [ ] Validation fails with helpful message if strategy has no entry conditions
- [ ] Progress modal displays immediately when backtest starts
- [ ] Progress bar shows percentage complete (0-100%)
- [ ] Estimated time remaining displayed and updates
- [ ] Current date being processed shown
- [ ] Trade count increments in real-time
- [ ] UI remains responsive during execution (background execution)
- [ ] "Cancel" button visible during backtest execution
- [ ] Cancel confirmation prompt displays correct message
- [ ] Cancellation stops processing within 2 seconds
- [ ] UI returns to configuration state after cancellation
- [ ] "Cancel and Keep Partial Results" option available
- [ ] Backtest status updates correctly (running -> completed/failed/pending)
- [ ] Results stored when backtest completes successfully
- [ ] Error messages displayed when execution fails
- [ ] BacktestLibrary shows running backtests with progress badge

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/server && uv run pytest tests/test_backtest_executor.py -v` - Run backtest executor specific tests
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_backtest_execution.md` to validate E2E functionality

## Notes
- **Historical Data Fetching**: The execution engine needs to fetch historical price data for the backtest date range. Use the existing `/api/prices` endpoint or implement a dedicated historical data service if the date range is large.
- **Condition Evaluation**: The execution engine needs to evaluate strategy conditions against candle data. This requires parsing the strategy's conditions, indicators, and patterns and evaluating them programmatically. Consider implementing a simple condition evaluator or using existing logic from the strategy builder.
- **Performance**: For very large date ranges (years of data), consider batch processing and more efficient progress updates to avoid database write overhead.
- **Future Enhancements**:
  - WebSocket for real-time updates instead of polling
  - Results visualization page with equity curve and trade breakdown
  - Multiple concurrent backtest queuing
  - Backtest comparison feature
- **Polling Interval**: 1500ms provides good balance between responsiveness and server load. Can be adjusted based on performance testing.
- **Cancellation Grace Period**: The 2-second cancellation requirement means the execution loop must check the cancel event frequently (at least every 100-200 candles).
