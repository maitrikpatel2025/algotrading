# E2E Test: Backtest Execution

Test the Backtest Execution functionality including running backtests, progress tracking, cancellation, and completion flow.

## User Story

As a trader
I want to execute a backtest and see real-time progress, with the ability to cancel if needed
So that I can validate my trading strategies against historical data while maintaining control over long-running operations

## Prerequisites

- At least one strategy exists with entry conditions defined
- At least one backtest configuration exists linked to a valid strategy

## Test Steps

### Setup: Ensure Test Data Exists

1. Navigate to the `Application URL` (redirects to home page)
2. Take a screenshot of the initial state (Home page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links including "Backtest"

### Test Run Button and Validation

5. Click on "Backtest" in the navigation
6. Wait for backtests API response
7. Take a screenshot of the Backtest Library page
8. **Verify** page header shows "Backtests"

9. If backtest cards exist:
   - Click on an existing backtest card to open configuration
   - Wait for navigation to `/backtests/{id}/edit`
10. If no backtests exist:
    - Click "New Backtest" button
    - Wait for navigation to `/backtests/new`
    - Fill in required fields (name, strategy, dates)
    - Save the backtest first

11. Take a screenshot of the Backtest Configuration page
12. **Verify** "Run Backtest" button is visible next to Save button
13. **Verify** "Run Backtest" button has play icon or appropriate styling

### Test Strategy Validation Error

14. If a strategy without entry conditions is available:
    - Select that strategy in the dropdown
    - Click "Run Backtest" button
    - **Verify** error toast appears with message about missing entry conditions
    - Take a screenshot of validation error
    - Select a valid strategy with entry conditions

### Test Backtest Execution Start

15. Ensure a valid strategy with entry conditions is selected
16. Click "Run Backtest" button
17. **Verify** progress modal appears immediately
18. Take a screenshot of initial progress modal

### Test Progress Modal Display

19. **Verify** progress modal contains:
    - Modal title "Running Backtest" or similar
    - Progress bar showing percentage (0-100%)
    - Percentage text display
    - Estimated time remaining
    - Current date being processed
    - Trade count (starting at 0)
    - Candles processed / Total candles display
    - Cancel button

20. Take a screenshot showing progress at early stage (0-10%)

### Test Real-time Progress Updates

21. Wait for progress to update (1.5-2 seconds)
22. **Verify** progress percentage has increased
23. **Verify** current date being processed has changed
24. Take a screenshot showing progress update

25. Wait for additional progress updates
26. **Verify** candles processed count is incrementing
27. **Verify** estimated time remaining is updating
28. If trades have been simulated:
    - **Verify** trade count is incrementing in real-time
29. Take a screenshot showing mid-progress (30-50% if possible)

### Test Cancel Button Visibility

30. **Verify** Cancel button is visible and enabled during execution
31. **Verify** Cancel button has appropriate danger/red styling
32. Take a screenshot highlighting cancel button

### Test Cancel Confirmation Dialog

33. Click "Cancel" button
34. **Verify** confirmation dialog appears
35. **Verify** dialog shows message: "Cancel backtest? Partial results will be discarded."
36. **Verify** dialog has "Continue Running" button (secondary)
37. **Verify** dialog has "Cancel Backtest" button (danger)
38. **Verify** "Cancel and Keep Partial Results" option is available (checkbox or link)
39. Take a screenshot of cancel confirmation dialog

### Test Continue Running (Dismiss Cancel)

40. Click "Continue Running" button
41. **Verify** confirmation dialog closes
42. **Verify** progress modal is still visible
43. **Verify** backtest is still running (progress updating)
44. Take a screenshot after continuing

### Test Cancel and Discard Results

45. Click "Cancel" button again
46. **Verify** confirmation dialog appears
47. Do NOT check "Keep Partial Results"
48. Click "Cancel Backtest" button
49. **Verify** progress modal shows "Cancelling..." status
50. **Verify** cancellation completes within 2 seconds
51. **Verify** progress modal closes
52. **Verify** UI returns to configuration state
53. **Verify** backtest status is "Pending" (not running)
54. Take a screenshot after cancellation

### Test Run Again After Cancel

55. Click "Run Backtest" button again
56. **Verify** progress modal appears
57. **Verify** progress starts from 0%
58. Take a screenshot of restarted backtest

### Test Cancel and Keep Partial Results

59. Wait until progress reaches at least 20%
60. Click "Cancel" button
61. **Verify** confirmation dialog appears
62. Check "Cancel and Keep Partial Results" option (or click the link)
63. Click "Cancel Backtest" button
64. **Verify** progress modal shows "Saving partial results..."
65. **Verify** cancellation completes
66. **Verify** toast notification mentions partial results saved
67. Take a screenshot after partial results save

### Test Successful Completion

68. Click "Run Backtest" button again
69. **Verify** progress modal appears
70. Wait for backtest to complete (progress reaches 100%)
71. **Verify** progress bar shows 100%
72. **Verify** status changes to "Completing..." or "Complete"
73. Take a screenshot at 100% completion

74. **Verify** progress modal closes automatically (or shows completion state)
75. **Verify** success toast notification appears
76. **Verify** backtest status changes to "Completed"
77. Take a screenshot of completed state

### Test BacktestLibrary Running Status

78. Navigate to `/backtests` (Backtest Library)
79. Take a screenshot of library page

80. If another backtest can be run:
    - Open a different backtest configuration
    - Click "Run Backtest"
    - Navigate back to `/backtests` while running

81. **Verify** running backtest card shows:
    - Animated progress indicator
    - Progress percentage badge
    - "View Progress" quick action (if available)
82. Take a screenshot of running backtest in library

83. Click on the running backtest card
84. **Verify** progress modal opens showing current progress
85. Take a screenshot of progress modal from library

### Test UI Responsiveness During Execution

86. While a backtest is running:
    - Navigate to different pages (Strategy, Monitor)
    - Navigate back to Backtest Configuration
87. **Verify** UI remains responsive throughout
88. **Verify** backtest continues running in background
89. **Verify** progress modal can be re-opened
90. Take a screenshot demonstrating UI responsiveness

### Test Error Handling

91. (If possible to simulate) Test error scenario:
    - **Verify** error toast displays when execution fails
    - **Verify** progress modal closes or shows error state
    - **Verify** backtest status changes to "Failed"
    - **Verify** error message is displayed
92. Take a screenshot of error state (if applicable)

### Cleanup

93. Navigate to `/backtests`
94. Delete any test backtests created during this test
95. Take final screenshot of library state

## Success Criteria

- "Run Backtest" button is visible on BacktestConfiguration page
- Validation fails with helpful message if strategy has no entry conditions
- Progress modal displays immediately when backtest starts
- Progress bar shows percentage complete (0-100%)
- Estimated time remaining is displayed and updates
- Current date being processed is shown
- Trade count increments in real-time
- Candles processed / Total candles display is accurate
- UI remains responsive during execution (background execution)
- "Cancel" button is visible during backtest execution
- Cancel confirmation prompt displays correct message
- "Cancel and Keep Partial Results" option is available
- Cancellation stops processing within 2 seconds
- UI returns to configuration state after cancellation
- Backtest completes successfully and shows completion status
- BacktestLibrary shows running backtests with progress badge
- 15+ screenshots are taken documenting the flow
