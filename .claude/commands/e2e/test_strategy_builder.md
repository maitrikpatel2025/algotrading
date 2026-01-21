# E2E Test: Strategy Builder

Test the Strategy Builder page functionality including chart display, indicator management, condition logic, and strategy saving.

## User Story

As a trader
I want to create and configure trading strategies using a visual builder
So that I can define entry/exit conditions with technical indicators and patterns

## Test Steps

1. Navigate to the `Application URL` (redirects to home page)
2. Take a screenshot of the initial state (Home page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links to Home, Strategy, and Account

5. Navigate to `/strategies/new`
6. Wait for page to fully load (network idle)
7. Take a screenshot of the initial Strategy Builder page
8. **Verify** the page header is visible with navigation
9. **Verify** the pair selector is visible (showing EUR_USD or similar)
10. **Verify** timeframe buttons are visible (5m, 15m, 1h, 1d)

11. Wait for price chart to load (canvas element should be visible)
12. Take a screenshot of the loaded chart
13. **Verify** the chart canvas is rendered and visible
14. **Verify** candlestick data is displayed on the chart
15. **Verify** the chart has proper dimensions (not collapsed)

16. Click on the pair selector dropdown/button
17. Take a screenshot of the pair dropdown options
18. **Verify** multiple currency pairs are available (EUR_USD, GBP_USD, etc.)
19. Select "GBP_USD" from the options
20. Wait for chart data to reload
21. Take a screenshot after pair change
22. **Verify** the selected pair is now displayed as GBP_USD
23. **Verify** chart updates with new data

24. Click on the "1h" timeframe button
25. Wait for data to reload
26. Take a screenshot after timeframe change
27. **Verify** the 1h button appears selected/active (highlighted styling)
28. **Verify** chart data reflects hourly candles

29. Click on the "15m" timeframe button
30. Wait for data to reload
31. **Verify** the 15m button is now selected
32. **Verify** chart updates with 15-minute candles

33. Locate the candle count selector (50, 100, 200 buttons)
34. Click on "100" candle count button
35. Wait for data to reload
36. Take a screenshot after candle count change
37. **Verify** the 100 button appears selected
38. **Verify** chart displays more candles than before

39. Look for "Add Indicator" button or indicator panel
40. Click to open indicator selection
41. Take a screenshot of indicator options
42. **Verify** indicator categories or list is visible

43. Search or find "SMA" (Simple Moving Average)
44. Click to add SMA indicator
45. Wait for indicator to render on chart
46. Take a screenshot with SMA added
47. **Verify** SMA line is visible on the price chart

48. Add "RSI" indicator (if available)
49. Take a screenshot with multiple indicators
50. **Verify** RSI appears in a subchart below the main chart

51. Look for Logic Panel toggle or button
52. Click to open/expand the Logic Panel
53. Take a screenshot of the Logic Panel
54. **Verify** condition sections are visible (Entry/Exit)
55. **Verify** trade direction options are available (Long, Short, Both)

56. Find trade direction selector
57. Select "Long" trade direction
58. Take a screenshot with Long selected
59. **Verify** Long option is highlighted/selected

60. Select "Both" trade direction
61. **Verify** Both option is now selected

62. Click on "Save" button to open save dialog
63. Take a screenshot of the save dialog
64. **Verify** save dialog/modal is visible
65. **Verify** name input field is present
66. **Verify** Save/Submit button is visible

67. Enter strategy name: "E2E Test Strategy"
68. Take a screenshot with name entered
69. **Verify** the name field contains the entered text

70. Click Save/Submit button
71. Wait for save API response
72. Take a screenshot after save
73. **Verify** success toast/notification appears OR page navigates to edit mode

74. After saving, verify URL changed to `/strategies/{id}/edit`
75. Take a screenshot of edit mode
76. **Verify** strategy name is displayed
77. **Verify** all previously configured settings are preserved

78. Click on "Strategies" in the navigation bar (or back button)
79. Wait for navigation
80. **Verify** URL is now `/strategies`
81. Take a screenshot of Strategy Library
82. **Verify** the saved strategy appears in the list

## Success Criteria
- Strategy Builder page loads without errors
- Price chart renders with candlestick data
- Pair selection changes chart data
- Timeframe selection updates chart candles
- Candle count selection adjusts visible data
- Indicators can be added to the chart
- Logic Panel displays condition sections
- Trade direction can be selected
- Save dialog opens and accepts input
- Strategy saves successfully
- Saved strategy appears in library
- 5+ screenshots are taken
