# E2E Test: Indicator Settings

Test the indicator settings dialog functionality for customizing indicator parameters in the Forex Trading Dashboard Strategy page.

## User Story

As a forex trader
I want to customize indicator parameters (period, color) when adding indicators and edit them after adding
So that I can perform professional-grade technical analysis with full flexibility like TradingView

## Prerequisites

- Application is running at the Application URL
- Price data is loaded on the Strategy page

## Test Steps

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Take a screenshot of the initial state (Monitor page)
3. **Verify** the page loads successfully

4. Click on "Strategy" in the navigation
5. Take a screenshot of the Strategy page
6. **Verify** the Strategy page loads with indicator library panel visible

7. Click "Load Data" button to load price data
8. Wait for chart to render with price data
9. Take a screenshot showing the chart with data loaded
10. **Verify** the price chart is displayed

### Test Settings Dialog Opens on Drop

11. Locate the "EMA" indicator in the Trend category
12. Drag the EMA indicator onto the chart
13. **Verify** the indicator settings dialog opens
14. Take a screenshot showing the settings dialog
15. **Verify** the dialog contains:
    - Title "Configure EMA"
    - Period input field with default value 20
    - Color selector with preset colors
    - "Add Indicator" and "Cancel" buttons

### Test Customizing Period Parameter

16. Change the period value from 20 to 50
17. Take a screenshot showing the modified period
18. **Verify** the period input shows 50
19. Click "Add Indicator" button
20. **Verify** the dialog closes
21. **Verify** an "EMA (50)" badge appears in the active indicators section
22. Take a screenshot showing EMA (50) on the chart

### Test Adding Multiple Instances with Different Parameters

23. Drag another EMA indicator onto the chart
24. **Verify** the settings dialog opens again
25. Change the period to 200
26. Select a different color (e.g., purple)
27. Click "Add Indicator"
28. Take a screenshot showing both EMA (50) and EMA (200) on the chart
29. **Verify** both "EMA (50)" and "EMA (200)" badges appear
30. **Verify** the two EMA lines have different colors on the chart

### Test Cancel Button

31. Drag a "SMA" indicator onto the chart
32. **Verify** the settings dialog opens
33. Click "Cancel" button
34. **Verify** the dialog closes without adding the indicator
35. **Verify** no SMA badge appears in the active indicators

### Test Edit Existing Indicator

36. Click on the "EMA (50)" badge in the active indicators section
37. **Verify** the settings dialog opens with current values (period: 50)
38. Take a screenshot showing edit mode dialog
39. **Verify** the dialog has "Update" button instead of "Add Indicator"
40. Change the period to 100
41. Click "Update"
42. **Verify** the badge now shows "EMA (100)"
43. Take a screenshot showing the updated indicator

### Test Subchart Indicator Settings (RSI)

44. Drag the "RSI" indicator from the Momentum category onto the chart
45. **Verify** the settings dialog opens
46. **Verify** the dialog shows period input with default value 14
47. Take a screenshot of RSI settings dialog
48. Change the period to 21
49. Click "Add Indicator"
50. **Verify** an "RSI (21)" badge appears
51. **Verify** the RSI indicator renders in a subchart below the main chart

### Test MACD Settings (Multiple Parameters)

52. Drag the "MACD" indicator onto the chart
53. **Verify** the settings dialog opens with three period inputs:
    - Fast Period (default: 12)
    - Slow Period (default: 26)
    - Signal Period (default: 9)
54. Take a screenshot of MACD settings dialog
55. Change Fast Period to 8, Slow Period to 17, Signal Period to 9
56. Click "Add Indicator"
57. **Verify** a "MACD (8, 17, 9)" badge appears

### Test Bollinger Bands Settings (Period and Standard Deviation)

58. Drag the "Bollinger Bands" indicator onto the chart
59. **Verify** the settings dialog opens with:
    - Period input (default: 20)
    - Standard Deviation input (default: 2)
60. Take a screenshot of Bollinger Bands settings dialog
61. Change period to 30 and standard deviation to 2.5
62. Click "Add Indicator"
63. **Verify** a "BB (30, 2.5)" badge appears

### Test Extended Candle Count Options

64. Locate the candle count selector in the chart controls
65. Click on the candle count dropdown
66. **Verify** options include 500, 1000, and 2000 in addition to existing options
67. Take a screenshot showing extended candle options
68. Select 500 candles
69. Wait for chart to reload with more data
70. Take a screenshot showing chart with 500 candles

### Test EMA (200) with Large Dataset

71. Change candle count to 1000
72. Wait for chart to reload
73. Drag an EMA indicator onto the chart
74. Set period to 200
75. Click "Add Indicator"
76. **Verify** the EMA (200) line renders across the chart (starting from candle 200)
77. Take a screenshot showing EMA (200) on large dataset

### Test Input Validation

78. Drag an SMA indicator onto the chart
79. Try to enter a period value of 0
80. **Verify** the input shows validation error or prevents invalid value
81. Try to enter a period value of 500 (larger than typical limit)
82. **Verify** appropriate validation behavior
83. Take a screenshot showing validation

## Success Criteria

- Indicator settings dialog opens when dropping an indicator onto the chart
- Dialog shows appropriate input fields based on indicator type:
  - Simple indicators (SMA, EMA, RSI, etc.): Period and color
  - MACD: Fast Period, Slow Period, Signal Period, and color
  - Bollinger Bands: Period, Standard Deviation, and color
  - Stochastic: K Period, D Period, and color
- Users can customize parameter values before adding indicators
- Multiple instances of the same indicator can be added with different parameters
- Cancel button closes dialog without adding indicator
- Clicking indicator badge opens edit mode with current values
- Update button in edit mode changes indicator parameters
- Indicator badge displays custom parameters (e.g., "EMA (50)" not just "EMA")
- Extended candle count options (500, 1000, 2000) are available
- Long-period indicators (e.g., EMA 200) calculate correctly on large datasets
- Input validation prevents invalid parameter values
- 15+ screenshots are taken documenting the full test flow
