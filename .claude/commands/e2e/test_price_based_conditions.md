# E2E Test: Price-Based Conditions

Test the creation and configuration of price-based trading conditions in the Logic Panel.

## User Story

As a forex trader
I want to create conditions based on price action (e.g., "Close crosses above Upper BB")
So that I can define precise entry and exit triggers

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

### Test Add Condition Button

12. Locate the "Add Condition" button in the "Long Entry" section of the Logic Panel
13. Click the "Add Condition" button
14. Take a screenshot showing the new condition block
15. **Verify** a new condition block appears in the "Long Entry" section
16. **Verify** the condition block has default values (Close Price as left operand)
17. **Verify** the condition block shows animation when appearing (fly-in effect)

### Test Price Element Dropdown Options

18. Click on the left operand dropdown in the new condition block
19. Take a screenshot showing the dropdown options
20. **Verify** dropdown shows "Price" group header
21. **Verify** dropdown shows price sources: "Close Price", "Open Price", "High Price", "Low Price"
22. **Verify** dropdown is searchable (search input visible)

### Test Search/Autocomplete Functionality

23. Type "close" in the search input of the dropdown
24. Take a screenshot showing filtered results
25. **Verify** dropdown filters to show only "Close Price" option
26. Clear the search and type "high"
27. **Verify** dropdown filters to show "High Price" option
28. Select "Close Price" from the dropdown

### Test Comparison Operator Dropdown

29. Click on the operator dropdown (middle dropdown)
30. Take a screenshot showing operator options
31. **Verify** dropdown shows all comparison operators:
    - "Crosses Above"
    - "Crosses Below"
    - "Is Above"
    - "Is Below"
    - "Equals"
32. Select "Crosses Above" operator

### Test Reference Dropdown Options

33. Click on the right operand dropdown
34. Take a screenshot showing reference options
35. **Verify** dropdown shows "Price" group with price elements
36. **Verify** dropdown shows "Value" group with numeric input option
37. **Verify** dropdown is searchable

### Test Adding Indicator for Reference

38. Drag and drop "EMA" indicator onto the chart
39. Wait for indicator calculation
40. Take a screenshot showing EMA on chart
41. Click on the right operand dropdown again
42. Take a screenshot showing updated dropdown with indicator
43. **Verify** dropdown now shows "Indicators" group
44. **Verify** dropdown shows "EMA (20)" option in the Indicators group
45. Select "EMA (20)" from the dropdown

### Test Natural Language Preview

46. Take a screenshot showing the complete condition with preview
47. **Verify** a natural language preview is displayed below the dropdowns
48. **Verify** the preview shows "When Close Price crosses above EMA (20)"
49. **Verify** the preview text has subtle styling (smaller font, muted color)

### Test Multi-Component Indicator Reference

50. Drag and drop "Bollinger Bands" indicator onto the chart
51. Wait for indicator calculation
52. Take a screenshot showing Bollinger Bands on chart
53. Click on the right operand dropdown
54. Take a screenshot showing Bollinger Bands options
55. **Verify** dropdown shows sub-components: "BB Upper (20, 2)", "BB Middle (20, 2)", "BB Lower (20, 2)"
56. Select "BB Upper (20, 2)" from the dropdown
57. **Verify** the natural language preview updates to "When Close Price crosses above BB Upper (20, 2)"

### Test Invalid Condition Validation

58. Click the X button on the EMA indicator badge in the chart header
59. Click "Remove Indicator" in the confirmation dialog
60. Take a screenshot showing the condition state after indicator removal
61. **Verify** the EMA condition block shows a warning indicator (AlertTriangle icon)
62. Hover over the warning icon
63. Take a screenshot showing the error tooltip
64. **Verify** tooltip shows error message about missing indicator

### Test Multiple Conditions in Section

65. Click "Add Condition" button again in the "Long Entry" section
66. Take a screenshot showing multiple condition blocks
67. **Verify** a second condition block appears below the first
68. **Verify** the new condition block has default values

### Test Condition Creation in Different Sections

69. Locate the "Add Condition" button in the "Long Exit" section
70. Click the "Add Condition" button
71. Take a screenshot showing condition in Long Exit section
72. **Verify** a condition block appears in the "Long Exit" section
73. **Verify** the condition block has the appropriate section styling

### Test Price vs Price Condition

74. In the Long Exit condition, select "High Price" as left operand
75. Select "Is Above" as operator
76. Select "Low Price" as right operand
77. Take a screenshot showing price vs price condition
78. **Verify** natural language preview shows "When High Price is above Low Price"

### Test Fixed Value Reference

79. Click "Add Condition" in Long Entry section
80. Select "Close Price" as left operand
81. Select "Is Above" as operator
82. Click on the right operand dropdown
83. Select "Fixed Value" option from the Value group
84. Type "1.5000" in the value input
85. Take a screenshot showing condition with fixed value
86. **Verify** natural language preview shows "When Close Price is above 1.5000"

### Test Condition Modification Updates Preview

87. Change the operator to "Crosses Below"
88. **Verify** natural language preview updates to "When Close Price crosses below 1.5000"
89. Change left operand to "Open Price"
90. **Verify** natural language preview updates to "When Open Price crosses below 1.5000"

### Test Standalone Condition Validation

91. Take a screenshot of all conditions
92. **Verify** standalone conditions (without indicator instance) are valid when both operands are set
93. **Verify** only conditions referencing removed indicators show warning state

### Test Delete Standalone Condition

94. Click the X button on one of the standalone condition blocks
95. **Verify** a confirmation dialog appears
96. Click "Remove Condition" in the dialog
97. Take a screenshot after condition removal
98. **Verify** the condition block is removed from the section

## Success Criteria

- "Add Condition" button creates a new configurable condition block
- Condition block appears with default values (Close Price, crosses_above, null)
- Price element dropdown shows Open, High, Low, Close options
- Comparison operator dropdown shows all 5 operator options
- Reference dropdown shows price elements, indicators, and fixed value option
- Autocomplete (search) filters options as user types
- Search is case-insensitive and matches partial strings
- Adding indicators to chart updates the dropdown options
- Multi-component indicators show sub-component options
- Natural language preview displays correctly below the dropdowns
- Preview updates in real-time as condition is modified
- Invalid conditions (removed indicator) show warning icon with tooltip
- Tooltip explains the validation error clearly
- Multiple conditions can be added to the same section
- Conditions can be added to different sections independently
- Standalone conditions validate properly (no false warnings)
- Conditions can be deleted via confirmation dialog
- 25+ screenshots documenting the full test flow
