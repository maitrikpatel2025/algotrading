# Feature: Set Condition Time Filters

## Metadata
issue_number: `76`
adw_id: `77187659`
issue_json: `{"number":76,"title":"Feature Set Condition Time Filters US-VSB-019","body":"/feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n\n Feature Set Condition Time Filters \n\nI want to add time-based filters to my conditions (e.g., \"Only during London session\")\nSo that I can restrict trading to specific market hours\nAcceptance Criteria:\n\n Time filter options: specific hours (HH:MM - HH:MM), trading sessions (Sydney, Tokyo, London, New York), days of week\n Timezone selector with common options (UTC, EST, GMT, Local)\n Multiple time windows can be combined with OR\n Visual timeline shows active trading hours\n Pre-built session templates available\n \"Exclude\" option to blackout specific times (e.g., news events)"}`

## Feature Description
This feature adds time-based filtering capabilities to the trading condition system, allowing traders to restrict when their trading strategies are active. Traders can define specific time windows (e.g., 9:30 AM - 4:00 PM), select pre-built trading sessions (Sydney, Tokyo, London, New York), filter by days of the week, and configure timezone preferences. Multiple time windows can be combined with OR logic, and an "exclude" option allows blacklisting specific times. A visual timeline component shows the active trading hours at a glance.

## User Story
As a **forex trader**
I want to **add time-based filters to my conditions (e.g., "Only during London session")**
So that **I can restrict trading to specific market hours and avoid volatile or illiquid periods**

## Problem Statement
Currently, the trading condition system evaluates conditions at all times without any time-based restrictions. Traders cannot:
- Limit trading to specific market sessions (London, New York overlap for best liquidity)
- Exclude weekends or specific days
- Avoid trading during news events or low-volume periods
- Adapt strategies to their preferred timezone

This limits the precision of trading strategies and exposes traders to unfavorable market conditions.

## Solution Statement
Implement a comprehensive time filter system that:
1. Adds time filter configuration as a strategy-level setting (applies to all conditions in a section)
2. Provides pre-built session templates for major forex sessions
3. Supports custom time windows with start/end times
4. Includes a timezone selector with common options
5. Allows multiple time windows to be combined with OR logic
6. Provides an "exclude" mode to blackout specific times
7. Shows a visual 24-hour timeline of active trading hours
8. Persists time filter settings to localStorage
9. Integrates with the Test Logic evaluation system

## Relevant Files
Use these files to implement the feature:

### Core Logic & Constants
- `app/client/src/app/constants.js` - Add new time filter constants (TIME_FILTER_TYPES, TRADING_SESSIONS, DAYS_OF_WEEK, TIMEZONES, storage keys)
- `app/client/src/app/conditionDefaults.js` - Add time filter validation and evaluation functions

### UI Components
- `app/client/src/components/LogicPanel.jsx` - Add time filter section/controls to the Logic Panel header area
- `app/client/src/components/CandleCloseToggle.jsx` - Reference for toggle button patterns and styling
- `app/client/src/components/MultiTimeframeConditionDialog.jsx` - Reference for dialog patterns and multi-step forms

### Strategy Page Integration
- `app/client/src/pages/Strategy.jsx` - Add time filter state management and persistence

### New Files
- `app/client/src/components/TimeFilterDialog.jsx` - Main dialog for configuring time filters
- `app/client/src/components/TimeFilterBadge.jsx` - Compact badge showing active time filters
- `app/client/src/components/TimeFilterTimeline.jsx` - Visual 24-hour timeline component
- `app/client/src/app/timeFilterUtils.js` - Utility functions for time filter logic (evaluation, parsing, formatting)
- `.claude/commands/e2e/test_condition_time_filters.md` - E2E test specification for the feature

### Documentation
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_trading_dashboard.md` to understand how to create the E2E test file

## Implementation Plan

### Phase 1: Foundation
1. Define all time filter constants in `constants.js`:
   - Trading session definitions with start/end times in UTC
   - Timezone options (UTC, EST, GMT, Local)
   - Days of week constants
   - localStorage key for persistence

2. Create time filter utility functions in `timeFilterUtils.js`:
   - Time parsing and formatting
   - Session overlap calculations
   - Current time evaluation against filters
   - Timezone conversion helpers

### Phase 2: Core Implementation
1. Create `TimeFilterDialog.jsx` component:
   - Multi-step form similar to MultiTimeframeConditionDialog
   - Session template quick-select buttons
   - Custom time range inputs
   - Day of week checkboxes
   - Timezone selector
   - Include/Exclude mode toggle
   - Preview of configured filter

2. Create `TimeFilterTimeline.jsx` component:
   - 24-hour horizontal timeline
   - Visual blocks for active time windows
   - Session labels
   - Current time indicator

3. Create `TimeFilterBadge.jsx` component:
   - Compact display of active time filter
   - Click to edit functionality
   - Clear button

### Phase 3: Integration
1. Add time filter state to `Strategy.jsx`:
   - State for time filter configuration
   - localStorage persistence
   - Integration with condition evaluation

2. Update `LogicPanel.jsx`:
   - Add time filter section in the panel header
   - Show TimeFilterBadge when filters are active
   - "Add Time Filter" button when no filter is set

3. Update condition evaluation in `conditionDefaults.js`:
   - Add time filter check in evaluateLogic function
   - Return time filter status in evaluation results

## Step by Step Tasks

### Step 1: Create E2E Test Specification
- Create `.claude/commands/e2e/test_condition_time_filters.md` with test steps for:
  - Opening the Time Filter dialog from the Logic Panel
  - Selecting a trading session template (London session)
  - Verifying the visual timeline shows the correct hours
  - Adding a custom time window
  - Selecting days of the week
  - Changing the timezone
  - Verifying the filter badge appears after saving
  - Testing the exclude mode
  - Verifying persistence after page reload

### Step 2: Add Time Filter Constants
- Add to `app/client/src/app/constants.js`:
  - `TIME_FILTER_MODES` (include/exclude)
  - `TRADING_SESSIONS` (Sydney, Tokyo, London, New York with UTC times)
  - `TIMEZONES` (UTC, EST, GMT, Local with offset data)
  - `DAYS_OF_WEEK` (Monday-Friday)
  - `TIME_FILTER_STORAGE_KEY`
  - Session overlap calculations (e.g., London/New York overlap)

### Step 3: Create Time Filter Utilities
- Create `app/client/src/app/timeFilterUtils.js` with:
  - `parseTimeString(timeStr)` - Parse "HH:MM" format
  - `formatTimeString(hours, minutes)` - Format to "HH:MM"
  - `getSessionTimes(sessionId, timezone)` - Get session start/end in local TZ
  - `isTimeInWindow(time, startTime, endTime)` - Check if time is in window
  - `isTimeInSessions(time, sessions, timezone)` - Check multiple sessions
  - `isDayAllowed(date, allowedDays)` - Check day of week
  - `evaluateTimeFilter(timeFilter, currentTime)` - Main evaluation function
  - `getActiveHoursForTimeline(timeFilter)` - Get hours for timeline display
  - `convertToTimezone(date, timezone)` - Timezone conversion
  - `getCurrentTimeInTimezone(timezone)` - Get current time in TZ

### Step 4: Create TimeFilterTimeline Component
- Create `app/client/src/components/TimeFilterTimeline.jsx`:
  - 24-hour horizontal bar (0-24 hours)
  - Hour markers and labels
  - Colored blocks for active periods
  - Session name labels
  - Current time indicator line
  - Grayscale for excluded periods
  - Responsive design (collapses on mobile)
  - Props: `timeFilter`, `timezone`, `showCurrentTime`

### Step 5: Create TimeFilterBadge Component
- Create `app/client/src/components/TimeFilterBadge.jsx`:
  - Compact pill/badge showing summary (e.g., "London + NY")
  - Clock icon prefix
  - Click to edit (opens dialog)
  - X button to clear filter
  - Tooltip showing full details
  - Color coding for include (primary) vs exclude (amber/warning)
  - Props: `timeFilter`, `onEdit`, `onClear`

### Step 6: Create TimeFilterDialog Component
- Create `app/client/src/components/TimeFilterDialog.jsx`:
  - Modal dialog following MultiTimeframeConditionDialog patterns
  - Header with title and close button
  - Mode toggle: Include (default) / Exclude

  - **Section 1: Quick Session Templates**
    - Grid of session buttons (Sydney, Tokyo, London, New York)
    - Each button shows session hours
    - Multi-select allowed (OR logic)
    - "Clear All" button

  - **Section 2: Custom Time Windows**
    - "Add Custom Window" button
    - List of custom windows with start/end time inputs
    - Delete button per window
    - Time inputs with HH:MM format

  - **Section 3: Days of Week**
    - Checkbox for each weekday (Mon-Fri default)
    - "Select All" / "Clear All" buttons

  - **Section 4: Timezone**
    - Dropdown selector with common timezones
    - Preview of session times in selected TZ

  - **Preview Section**
    - TimeFilterTimeline showing configured filter
    - Text summary of active hours

  - **Footer**
    - Cancel and Save buttons
    - Save disabled if no filter configured

### Step 7: Add Time Filter State to Strategy.jsx
- Add to `app/client/src/pages/Strategy.jsx`:
  - `timeFilter` state with shape:
    ```js
    {
      mode: 'include' | 'exclude',
      sessions: ['london', 'new_york'],
      customWindows: [{ start: '09:30', end: '16:00' }],
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timezone: 'UTC',
      enabled: true
    }
    ```
  - Load from localStorage on mount
  - Save to localStorage on change
  - `handleTimeFilterChange(newFilter)` callback
  - `handleTimeFilterClear()` callback
  - `timeFilterDialogOpen` state
  - Pass time filter to LogicPanel

### Step 8: Integrate Time Filter into LogicPanel
- Update `app/client/src/components/LogicPanel.jsx`:
  - Add time filter section below panel header (above condition sections)
  - Show "Add Time Filter" button when no filter is set
  - Show TimeFilterBadge when filter is active
  - Show TimeFilterTimeline below badge (collapsible)
  - Pass callbacks to open dialog, clear filter
  - Add props: `timeFilter`, `onTimeFilterEdit`, `onTimeFilterClear`

### Step 9: Update Condition Evaluation
- Update `app/client/src/app/conditionDefaults.js`:
  - Modify `evaluateLogic` function to accept optional `timeFilter` parameter
  - Add time filter check at start of evaluation
  - If time filter fails, return early with `timeFilterActive: false`
  - Add `timeFilterStatus` to evaluation result:
    ```js
    {
      result: boolean,
      timeFilterActive: boolean,
      timeFilterReason: string | null, // e.g., "Outside London session"
      itemResults: [...],
      summary: {...}
    }
    ```

### Step 10: Update TestLogicDialog for Time Filter
- Update `app/client/src/components/TestLogicDialog.jsx`:
  - Show time filter status in results
  - Display whether current candle passes time filter
  - Show time filter reason if it fails
  - Visual indicator for time filter status

### Step 11: Add Tests
- Add unit tests for time filter utilities:
  - Test time parsing and formatting
  - Test session evaluation
  - Test timezone conversion
  - Test day of week filtering
  - Test include vs exclude mode

### Step 12: Run Validation Commands
- Execute all validation commands to ensure the feature works correctly with zero regressions

## Testing Strategy

### Unit Tests
- Time parsing functions handle edge cases (midnight, noon, invalid input)
- Session evaluation correctly identifies active sessions
- Timezone conversion works for all supported timezones
- Day of week filtering respects weekday/weekend
- Multiple time windows combine correctly with OR logic
- Exclude mode inverts the filter logic

### Edge Cases
- Midnight crossing (session from 22:00 to 06:00)
- DST transitions for EST/local timezones
- No sessions selected (should always fail)
- No days selected (should always fail)
- Empty custom windows
- Overlapping time windows
- Sessions that span multiple days

## Acceptance Criteria
- [ ] Time filter options include: specific hours (HH:MM - HH:MM), trading sessions (Sydney, Tokyo, London, New York), days of week
- [ ] Timezone selector includes: UTC, EST, GMT, Local
- [ ] Multiple time windows can be combined with OR logic
- [ ] Visual timeline shows active trading hours in 24-hour format
- [ ] Pre-built session templates are available for quick selection
- [ ] "Exclude" option allows blackout of specific times
- [ ] Time filter badge shows summary of active filter
- [ ] Time filter persists to localStorage and survives page reload
- [ ] Time filter integrates with Test Logic evaluation
- [ ] Time filter section appears in Logic Panel header
- [ ] Dialog follows existing UI patterns (MultiTimeframeConditionDialog style)
- [ ] All existing tests pass (zero regressions)
- [ ] E2E test validates the feature end-to-end

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_condition_time_filters.md` E2E test to validate this functionality works.
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes

### Trading Session Times (UTC)
| Session | Open (UTC) | Close (UTC) |
|---------|------------|-------------|
| Sydney | 21:00 | 06:00 |
| Tokyo | 23:00 | 08:00 |
| London | 07:00 | 16:00 |
| New York | 12:00 | 21:00 |

### Session Overlaps (High Liquidity)
- Tokyo/London: 07:00 - 08:00 UTC
- London/New York: 12:00 - 16:00 UTC (best forex liquidity)

### Timezone Offsets
- UTC: +0
- GMT: +0 (same as UTC)
- EST: -5 (or -4 during DST)
- Local: Browser timezone

### UI/UX Considerations
- Follow existing design patterns from CandleCloseToggle and MultiTimeframeConditionDialog
- Use consistent color coding (primary for active, muted for inactive, amber for warnings/exclude)
- Mobile-friendly layout with collapsible timeline
- Clear visual feedback when filter is active

### Future Enhancements (Not in Scope)
- Server-side time filter validation for backtesting
- Specific date exclusions (e.g., holidays, news events)
- Time filter templates that can be saved and reused
- Integration with economic calendar for automatic news event exclusions
