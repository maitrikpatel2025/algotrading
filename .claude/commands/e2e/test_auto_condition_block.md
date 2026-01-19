# E2E Test: Auto-Create Condition Block on Indicator Drop

Test the automatic creation of condition blocks in the Logic Panel when indicators are dropped onto the chart.

## User Story

As a forex trader
I want a corresponding condition block to automatically appear in the logic panel when I drop an indicator on the chart
So that I can immediately start defining trading rules using that indicator with its specific configuration

## Prerequisites

- Application is running at the Application URL
- Price data is loaded on the Strategy page

## Test Steps

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Take a screenshot of the initial state (Monitor page)
3. **Verify** the page loads successfully

4. Click on "Strategy" in the navigation
5. Take a screenshot of the Strategy page
6. **Verify** the Strategy page loads with indicator library panel visible on the left
7. **Verify** the Logic Panel is visible on the right side of the page

8. Click "Load Data" button to load price data
9. Wait for chart to render with price data
10. Take a screenshot showing the chart with data loaded
11. **Verify** the price chart is displayed
12. **Verify** the Logic Panel shows "Entry Conditions" and "Exit Conditions" sections
13. **Verify** the Logic Panel shows an empty state message when no conditions exist

### Test Auto-Creation of Condition Block on Indicator Drop

14. Locate the "SMA" indicator in the Trend category
15. Drag and drop the SMA indicator onto the chart
16. Wait for indicator calculation and rendering
17. Take a screenshot showing SMA on chart and condition block in Logic Panel
18. **Verify** a condition block appears in the "Entry Conditions" section of the Logic Panel
19. **Verify** the condition block displays "SMA (20)" as the indicator instance name
20. **Verify** the condition block shows a pre-populated condition (e.g., "Close Price crosses above SMA (20)")
21. **Verify** the condition block has a colored left border matching the SMA indicator color

### Test Multiple Indicator Instances

22. Drag and drop another "EMA" indicator onto the chart
23. Take a screenshot showing both indicators and condition blocks
24. **Verify** a second condition block appears in the Logic Panel
25. **Verify** the new condition block displays "EMA (20)" with its specific parameters
26. **Verify** both condition blocks are visible in the Entry Conditions section

### Test Condition Dropdown Shows All Indicators

27. Click on the left operand dropdown in the first condition block
28. Take a screenshot showing the dropdown options
29. **Verify** dropdown shows price sources: "Close Price", "Open Price", "High Price", "Low Price"
30. **Verify** dropdown shows indicator options for all chart indicators: "SMA (20)", "EMA (20)"

### Test Multi-Line Indicator Sub-Components

31. Drag and drop "Bollinger Bands" indicator onto the chart
32. Wait for indicator calculation
33. Take a screenshot showing Bollinger Bands condition block
34. **Verify** a condition block appears for Bollinger Bands
35. Click on the right operand dropdown in the Bollinger Bands condition block
36. **Verify** dropdown shows sub-components: "BB Upper (20, 2)", "BB Middle (20, 2)", "BB Lower (20, 2)"

### Test Subchart Indicator (RSI)

37. Drag and drop "RSI" indicator onto the chart
38. Wait for indicator calculation
39. Take a screenshot showing RSI condition block
40. **Verify** the RSI condition block shows a pre-populated condition (e.g., "RSI (14) is above 70")
41. **Verify** the RSI condition block has the RSI indicator color as left border

### Test Visual Connection (Hover Highlights)

42. Hover over the SMA condition block in the Logic Panel
43. Take a screenshot showing the highlight effect
44. **Verify** the SMA indicator line on the chart is highlighted (increased line width or glow)
45. Move mouse away from the condition block
46. **Verify** the chart indicator returns to normal state

47. Hover over the EMA indicator on the chart
48. Take a screenshot showing the condition block highlight
49. **Verify** the EMA condition block in the Logic Panel is highlighted

### Test Condition Block Deletion (Indicator Remains)

50. Click the X button on the SMA condition block
51. **Verify** a confirmation dialog appears asking to confirm deletion
52. Take a screenshot showing the confirmation dialog
53. Click "Remove Condition" in the confirmation dialog
54. **Verify** the SMA condition block is removed from the Logic Panel
55. **Verify** the SMA indicator REMAINS visible on the chart
56. Take a screenshot showing chart still has SMA but Logic Panel does not

### Test Indicator Deletion (Cascading to Conditions)

57. Click the X button on the EMA indicator badge in the chart header
58. **Verify** a confirmation dialog appears mentioning the related condition block
59. Take a screenshot showing the confirmation dialog with condition count
60. Click "Remove Indicator and Conditions" option
61. **Verify** the EMA indicator is removed from the chart
62. **Verify** the EMA condition block is removed from the Logic Panel
63. Take a screenshot showing both indicator and condition removed

### Test Condition Section Drag and Drop

64. Drag the RSI condition block from "Entry Conditions" section
65. Drop it into the "Exit Conditions" section
66. Take a screenshot showing RSI condition in Exit Conditions
67. **Verify** the RSI condition block now appears in the "Exit Conditions" section

### Test Undo Functionality for Conditions

68. Press Ctrl+Z (or Cmd+Z on Mac)
69. **Verify** the last removed indicator (EMA) is restored on the chart
70. **Verify** the corresponding EMA condition block is restored in the Logic Panel
71. Take a screenshot after undo

### Test Condition Animation

72. Drag and drop a new "MACD" indicator onto the chart
73. Observe the condition block creation
74. **Verify** the new condition block appears with a fly-in animation effect

### Test Logic Panel Collapse/Expand

75. Click the collapse button on the Logic Panel
76. Take a screenshot showing collapsed Logic Panel
77. **Verify** the Logic Panel collapses to a minimal vertical bar
78. Click to expand the Logic Panel
79. **Verify** the Logic Panel expands showing all condition blocks

### Test Mobile Overlay (Optional - Resize Browser)

80. Resize browser to mobile width (< 768px)
81. Take a screenshot of mobile layout
82. **Verify** the Logic Panel toggle button is visible
83. Click the Logic Panel toggle button
84. **Verify** the Logic Panel appears as an overlay

## Success Criteria

- Logic Panel is visible as a right sidebar on Strategy page
- Dropping any indicator automatically creates a linked condition block
- Condition block appears in "Entry Conditions" section by default
- Condition block creation is instantaneous (< 200ms after drop)
- Animation shows block appearing with fly-in effect
- Each indicator displays unique instance name with parameters (e.g., "EMA (50)")
- Condition block displays the specific indicator instance with its parameters
- Dropdown shows all indicator instances currently on the chart
- Multi-line indicators (Bollinger Bands, MACD) show sub-component options
- Hovering condition block highlights corresponding indicator on chart
- Hovering indicator on chart highlights corresponding condition block
- Color coding matches between chart indicator and condition block border
- Deleting indicator triggers confirmation with condition count
- Deleting condition block triggers confirmation (indicator remains)
- User can drag conditions between Entry and Exit sections
- Ctrl+Z undo works for both indicators and conditions
- Logic Panel can be collapsed and expanded
- Mobile layout shows overlay panel with toggle button
- 20+ screenshots documenting the full test flow
