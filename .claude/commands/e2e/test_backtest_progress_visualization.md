# E2E Test: Backtest Progress Visualization

Test the Backtest Progress Visualization functionality including real-time metrics display (Running P/L, Win Rate, Current Drawdown), mini equity curve chart, view mode toggle (compact/detailed), and performance mode option.

## User Story

As a trader
I want to see key metrics updating in real-time during the backtest
So that I get early feedback on strategy performance

## Prerequisites

- At least one strategy exists with entry conditions defined
- At least one backtest configuration exists linked to a valid strategy

## Test Steps

### Setup: Navigate to Backtest Configuration

1. Navigate to the `Application URL` (redirects to home page)
2. Take a screenshot of the initial state (Home page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links including "Backtest"

5. Click on "Backtest" in the navigation
6. Wait for backtests API response
7. Take a screenshot of the Backtest Library page
8. **Verify** page header shows "Backtests"

### Open Backtest Configuration

9. If backtest cards exist:
   - Click on an existing backtest card to open configuration
   - Wait for navigation to `/backtests/{id}/edit`
10. If no backtests exist:
    - Click "New Backtest" button
    - Wait for navigation to `/backtests/new`
    - Fill in required fields (name, strategy, dates)
    - Save the backtest first

11. Take a screenshot of the Backtest Configuration page
12. **Verify** "Run Backtest" button is visible

### Test Progress Modal Initial State

13. Click "Run Backtest" button
14. **Verify** progress modal appears immediately
15. Take a screenshot of initial progress modal
16. **Verify** progress modal contains:
    - Modal title "Running Backtest"
    - Progress bar showing percentage (0-100%)
    - Time Remaining display
    - Processing Date display
    - Candles count display
    - Trades count display

### Test Real-time Performance Metrics Display

17. Wait for progress to update (2-3 seconds for metrics to appear)
18. Take a screenshot showing progress metrics
19. **Verify** Running P/L metric is displayed:
    - Shows numerical value with +/- sign
    - Shows currency symbol ($)
    - Color-coded: green for positive, red for negative
20. **Verify** Win Rate metric is displayed:
    - Shows percentage value (e.g., "65.4%")
    - Has "%" symbol
21. **Verify** Current Drawdown metric is displayed:
    - Shows percentage value (e.g., "2.5%")
    - Color-coded appropriately when > 0

### Test Mini Equity Curve Chart

22. **Verify** mini equity curve chart is visible in detailed view mode
23. **Verify** chart container has appropriate height (approximately 120px)
24. Take a screenshot of the equity curve chart
25. **Verify** equity curve renders as a line chart:
    - Blue line showing equity progression
    - Reference line at initial balance (break-even point)
26. Wait for additional progress updates (2-3 seconds)
27. **Verify** equity curve updates as backtest progresses
28. Take a screenshot showing updated equity curve

### Test View Mode Toggle (Detailed vs Compact)

29. **Verify** view mode toggle button is present in modal header
30. Take a screenshot of detailed view mode (default)
31. **Verify** detailed view shows:
    - Mini equity curve chart
    - Running P/L metric
    - Win Rate metric
    - Current Drawdown metric
    - Full stats grid

32. Click view mode toggle to switch to compact mode
33. Wait for view mode transition
34. Take a screenshot of compact view mode
35. **Verify** compact view hides:
    - Mini equity curve chart
    - Extended metrics (P/L, Win Rate, Drawdown)
36. **Verify** compact view shows only:
    - Progress bar
    - Percentage complete
    - Time remaining
    - Trade count

37. Click view mode toggle to switch back to detailed mode
38. **Verify** detailed view is restored with all metrics visible
39. Take a screenshot after switching back to detailed view

### Test Performance Mode

40. **Verify** performance mode checkbox is present in modal footer
41. Take a screenshot showing performance mode option
42. **Verify** performance mode checkbox label reads "Performance Mode" or similar
43. Note the current polling frequency (observe progress update rate ~1.5s)

44. Check/enable the performance mode checkbox
45. **Verify** checkbox becomes checked
46. Wait for several progress updates
47. **Verify** polling interval has increased (updates less frequently, ~5s)
48. Take a screenshot with performance mode enabled

49. Uncheck/disable the performance mode checkbox
50. **Verify** polling returns to normal frequency (~1.5s)

### Test View Mode Persistence

51. Note current view mode (compact or detailed)
52. Close the progress modal (if completed) or cancel the backtest
53. Start the backtest again (click "Run Backtest")
54. **Verify** progress modal opens with previously selected view mode
55. Take a screenshot confirming view mode persistence

### Test Metrics During Progress Updates

56. If backtest is still running, observe metric updates:
57. **Verify** Running P/L updates as trades complete
58. **Verify** Win Rate updates after each trade (winning_trades / total_trades * 100)
59. **Verify** Drawdown updates appropriately based on equity changes
60. Take a screenshot showing mid-progress metrics state

### Test Backtest Completion with Final Metrics

61. Wait for backtest to complete (progress reaches 100%)
62. Take a screenshot at 100% completion showing final metrics
63. **Verify** final Running P/L displays total P/L for the backtest
64. **Verify** final Win Rate displays overall win percentage
65. **Verify** final Drawdown displays the current drawdown state

### Test Backward Compatibility

66. **Verify** if progress data is missing new fields (current_pnl, running_win_rate, etc.):
    - Modal still renders without errors
    - Basic progress information displays correctly
    - New metric sections show placeholder or default state

### Test Edge Cases

67. If possible, test with a strategy that produces:
    - All winning trades (100% win rate, no drawdown)
    - All losing trades (0% win rate, increasing drawdown)
    - Zero trades during partial backtest (win rate shows 0% or "N/A")
68. Take screenshots for any edge cases tested

### Cleanup

69. Close the progress modal
70. Navigate to `/backtests`
71. Take final screenshot of library state

## Success Criteria

- Running P/L displays in real-time with correct formatting (+$X.XX or -$X.XX) and color coding
- Win Rate displays as percentage (e.g., "65.4%") and updates after each trade
- Current Drawdown displays as percentage (e.g., "2.5%") with appropriate styling
- Mini equity curve chart renders and updates every progress poll
- Equity curve shows break-even reference line
- Compact view mode hides detailed metrics and chart, shows only progress essentials
- Detailed view mode shows all metrics and equity curve
- View mode preference persists across sessions (localStorage)
- Performance mode checkbox affects polling interval (1.5s normal, 5s performance mode)
- All new metrics are optional (backward compatible with older progress data)
- 15+ screenshots are taken documenting the flow
