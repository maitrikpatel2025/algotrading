# Condition Time Filters

**ADW ID:** 77187659
**Date:** 2026-01-20
**Specification:** specs/issue-76-adw-77187659-sdlc_planner-condition-time-filters.md

## Overview

This feature adds time-based filtering capabilities to the trading condition system, allowing traders to restrict when their trading strategies are active. Traders can define specific time windows, select pre-built trading sessions (Sydney, Tokyo, London, New York), filter by days of the week, and configure timezone preferences. A visual 24-hour timeline shows active trading hours at a glance.

## What Was Built

- **TimeFilterDialog** - Modal dialog for configuring time filters with session templates, custom time windows, day of week selection, and timezone configuration
- **TimeFilterBadge** - Compact badge showing summary of active time filters with click-to-edit and clear functionality
- **TimeFilterTimeline** - Visual 24-hour horizontal timeline showing active trading periods with session labels and current time indicator
- **Time Filter Utilities** - Comprehensive utility functions for time parsing, session evaluation, timezone conversion, and filter evaluation
- **Strategy Integration** - Time filter state management with localStorage persistence
- **LogicPanel Integration** - Time filter section with "Add Time Filter" button and badge display
- **TestLogicDialog Integration** - Time filter status display in logic evaluation results

## Technical Implementation

### Files Modified

- `app/client/src/app/constants.js`: Added TIME_FILTER_MODES, TRADING_SESSIONS, SESSION_OVERLAPS, TIMEZONES, DAYS_OF_WEEK, TIME_FILTER_STORAGE_KEY, and DEFAULT_TIME_FILTER constants
- `app/client/src/app/conditionDefaults.js`: Added evaluateLogicWithTimeFilter function that wraps condition evaluation with time filter checking
- `app/client/src/app/timeFilterUtils.js`: New file with 494 lines of time filter utility functions
- `app/client/src/components/TimeFilterDialog.jsx`: New dialog component (538 lines) for configuring time filters
- `app/client/src/components/TimeFilterBadge.jsx`: New badge component (93 lines) for displaying active time filters
- `app/client/src/components/TimeFilterTimeline.jsx`: New timeline component (208 lines) for visualizing active hours
- `app/client/src/components/LogicPanel.jsx`: Added time filter section with badge/button and passed timeFilter to TestLogicDialog
- `app/client/src/components/TestLogicDialog.jsx`: Added time filter status display showing active/blocked state with reasons
- `app/client/src/pages/Strategy.jsx`: Added time filter state management, localStorage persistence, and dialog integration

### Key Changes

- **Trading Sessions**: Pre-configured sessions for Sydney (21:00-06:00 UTC), Tokyo (23:00-08:00 UTC), London (07:00-16:00 UTC), and New York (12:00-21:00 UTC) with session overlaps for high liquidity periods
- **Time Filter Modes**: Include mode (trade only during specified times) and Exclude mode (blackout specified times)
- **Multiple Time Windows**: Support for combining multiple sessions or custom time windows with OR logic
- **Timezone Support**: UTC, GMT, EST, and Local browser timezone options with automatic conversion
- **Visual Timeline**: 24-hour horizontal bar showing active/inactive periods with color-coded sessions
- **Test Logic Integration**: Displays time filter pass/fail status with reasons when evaluating conditions

## How to Use

1. Navigate to the Strategy page
2. In the Logic Panel, click the "Add Time Filter" button (shows a clock icon with dashed border)
3. In the TimeFilterDialog:
   - Choose mode: "Include" (trade only during) or "Exclude" (blackout period)
   - Select trading sessions (Sydney, Tokyo, London, New York) - multiple can be selected
   - Optionally add custom time windows with specific start/end times
   - Select which days of the week the filter applies
   - Choose your timezone preference
   - Preview the configuration in the 24-hour timeline
4. Click "Save" to apply the filter
5. The TimeFilterBadge shows a summary (e.g., "London + New York")
6. Click the badge to edit, or the X button to clear the filter
7. Test the filter by clicking "Test Logic" - the dialog shows whether current time passes the filter

## Configuration

### Time Filter State Shape

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

### localStorage Persistence

- Storage key: `forex_dash_time_filter`
- Automatically loaded on page mount
- Automatically saved on any change

### Trading Session Times (UTC)

| Session | Open (UTC) | Close (UTC) | Color |
|---------|------------|-------------|-------|
| Sydney | 21:00 | 06:00 | Emerald |
| Tokyo | 23:00 | 08:00 | Amber |
| London | 07:00 | 16:00 | Blue |
| New York | 12:00 | 21:00 | Violet |

### Session Overlaps (High Liquidity)

- Tokyo/London: 07:00 - 08:00 UTC
- London/New York: 12:00 - 16:00 UTC (best forex liquidity)

## Testing

1. Open the Strategy page
2. Click "Add Time Filter" in the Logic Panel
3. Select a session (e.g., London)
4. Verify the timeline shows the correct hours highlighted
5. Save and verify the badge appears
6. Click "Test Logic" to verify the time filter status is displayed
7. Refresh the page and verify the filter persists
8. Test exclude mode by toggling the mode switch
9. Clear the filter and verify it returns to default state

## Notes

- Time filters apply at the strategy level to all conditions in a section
- Sessions that cross midnight (Sydney, Tokyo) are handled correctly with 24+ hour notation internally
- The current time indicator in the timeline updates to show where "now" falls within the 24-hour period
- When the time filter blocks evaluation, the Test Logic dialog shows "Condition evaluation skipped due to time filter restrictions"
- Color coding: Primary (blue) for include mode, Amber for exclude mode
