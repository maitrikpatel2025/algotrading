# E2E Test: Backtest Configuration

Test the Backtest Library and Backtest Configuration page functionality including listing, creating, configuring, and managing backtests.

## User Story

As a trader
I want to configure and run backtests on my saved strategies against historical market data
So that I can evaluate strategy performance before risking real capital

## Test Steps

1. Navigate to the `Application URL` (redirects to home page)
2. Take a screenshot of the initial state (Home page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links including "Backtest"

5. Click on "Backtest" in the navigation
6. Wait for backtests API response
7. Take a screenshot of the Backtest Library page
8. **Verify** page header shows "Backtests"
9. **Verify** page description "Manage your backtests" is visible
10. **Verify** "New Backtest" button is visible

11. **Verify** the page shows either:
    - Backtest cards in a grid layout, OR
    - Empty state message "No backtests yet"

12. Locate the search input field (placeholder: "Search backtests...")
13. Take a screenshot showing the search input
14. **Verify** search input is visible and enabled

15. Click "New Backtest" button
16. Wait for navigation
17. **Verify** URL changed to `/backtests/new`
18. Take a screenshot of Backtest Configuration page
19. **Verify** Backtest Configuration page loaded with header "Configure Backtest"

20. **Verify** the following form sections are present:
    - Name input field
    - Description textarea
    - Strategy Selector dropdown
    - Date Range Picker section with start and end date inputs
    - Initial Balance input with currency selector
    - Position Sizing section
    - Risk Management section

21. Enter "Test Backtest" in the name field
22. Enter "A test backtest for E2E testing" in the description field
23. Take a screenshot of filled name and description

24. Locate the Strategy Selector dropdown
25. Click on the Strategy Selector
26. **Verify** dropdown shows available strategies (or empty message if none)
27. Take a screenshot of strategy dropdown
28. If strategies are available, select the first strategy
29. **Verify** strategy preview shows selected strategy details (pair, direction)

30. Locate the Date Range Picker section
31. **Verify** preset buttons are visible (1M, 3M, 6M, 1Y, 2Y, 5Y)
32. Click the "3M" preset button
33. **Verify** date range is updated to last 3 months
34. Take a screenshot of date range picker

35. Locate the Initial Balance input
36. Clear and enter "10000"
37. **Verify** initial balance shows 10000
38. Locate the currency selector
39. **Verify** currency options include USD, EUR, GBP
40. Take a screenshot of initial balance section

41. Locate the Position Sizing section
42. **Verify** sizing method options are available:
    - Fixed Lot
    - Fixed Dollar
    - Percentage (default)
    - Risk-based
43. Select "Percentage" sizing method
44. Enter "2" for the position size percentage
45. **Verify** leverage selector is present (1:1 to 1:500 range)
46. **Verify** compound toggle is present
47. Take a screenshot of position sizing section

48. Locate the Risk Management section
49. **Verify** Stop Loss configuration is present with type selector
50. **Verify** Stop Loss types include: Fixed pips, Fixed dollar, ATR-based, Percentage, None
51. Select "Percentage" for stop loss type
52. Enter "2" for stop loss value
53. Take a screenshot of stop loss configuration

54. **Verify** Take Profit configuration is present
55. **Verify** Take Profit types include: Fixed pips, Fixed dollar, ATR-based, Percentage, Risk:Reward, None
56. Select "Risk:Reward" for take profit type
57. Enter "2" for take profit value (1:2 risk:reward)

58. **Verify** Trailing Stop configuration is present
59. **Verify** Trailing Stop types include: Fixed pips, ATR-based, Percentage, Break-even trigger, None
60. Take a screenshot of trailing stop configuration

61. **Verify** Partial Closes section is present with toggle
62. Enable partial closes toggle
63. **Verify** partial close level inputs appear
64. Take a screenshot of partial closes configuration

65. **Verify** Risk Preview Chart is visible
66. **Verify** chart shows entry price, stop loss, and take profit levels
67. Take a screenshot of risk preview chart

68. Locate the Save button
69. **Verify** Save button is enabled
70. Click Save button
71. Wait for save operation and navigation
72. **Verify** toast notification appears with success message
73. **Verify** URL changed to `/backtests`
74. Take a screenshot showing saved backtest in library

75. **Verify** new backtest "Test Backtest" appears in the library
76. **Verify** backtest card shows:
    - Name: "Test Backtest"
    - Status: "Pending"
    - Strategy name
    - Date range
    - Initial balance

77. Click on the backtest card (or Edit from context menu)
78. Wait for navigation
79. **Verify** URL is `/backtests/{id}/edit`
80. **Verify** form is populated with saved data
81. Take a screenshot of edit page

82. Navigate back to `/backtests`
83. Locate the backtest card context menu (three dots)
84. Click the context menu button
85. Take a screenshot of context menu
86. **Verify** menu shows: Edit, Duplicate, Delete

87. Click "Duplicate" in the menu
88. Wait for duplicate operation
89. **Verify** toast notification appears with success message
90. **Verify** duplicated backtest appears in library with name like "Test Backtest - Copy"
91. Take a screenshot showing both backtests

92. Click the context menu on the original backtest
93. Click "Delete"
94. **Verify** confirmation dialog appears
95. Take a screenshot of delete confirmation
96. Click "Delete" in confirmation dialog
97. Wait for delete operation
98. **Verify** toast notification appears
99. **Verify** backtest is removed from library

100. If no backtests exist after delete (empty state):
101. Navigate to `/backtests`
102. **Verify** empty state message is visible
103. **Verify** "Create Backtest" button is shown in empty state
104. Take a screenshot of empty state

## Success Criteria
- Navigation bar shows "Backtest" link between Strategies and Monitor
- Backtest Library page loads without errors
- Search filters backtests correctly
- Status filter works for all options (All, Pending, Completed, Failed)
- Sort changes backtest order
- New Backtest button navigates to configuration page
- Strategy selector shows saved strategies with preview
- Date range picker has all presets (1M, 3M, 6M, 1Y, 2Y, 5Y)
- Date range validation prevents invalid ranges
- Initial balance input works with currency selection
- Position sizing supports all four methods
- Leverage selector works correctly
- Compound toggle functions properly
- Stop Loss configuration works for all types
- Take Profit configuration works for all types
- Trailing Stop configuration works
- Partial closes can be configured
- Risk preview chart displays entry/SL/TP levels
- Save creates new backtest successfully
- Edit loads existing backtest data
- Duplicate creates copy with unique name
- Delete removes backtest with confirmation
- Toast notifications appear for all actions
- 10+ screenshots are taken
