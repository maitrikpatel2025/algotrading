# E2E Test: Chart Drawing Tools

Test the chart drawing tools functionality for adding horizontal lines, trendlines, and Fibonacci retracements to the Forex Trading Dashboard Strategy page.

## User Story

As a forex trader
I want to add drawing annotations to my charts
So that I can mark key price levels, draw trend lines, and visualize Fibonacci retracements for my technical analysis

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

### Test Drawing Toolbar

11. Locate the drawing toolbar in the chart header area (near Volume toggle)
12. Take a screenshot showing the drawing toolbar
13. **Verify** the toolbar displays the following tools:
    - Pointer tool (default selected)
    - Horizontal Line tool (H)
    - Trendline tool (T)
    - Fibonacci tool (F)

14. **Verify** keyboard shortcut hints are visible on the toolbar buttons
15. **Verify** the Pointer tool is highlighted as the active tool by default

### Test Horizontal Line Drawing

16. Click on the "Horizontal" button in the drawing toolbar
17. **Verify** the Horizontal Line tool is now selected (highlighted)
18. **Verify** the cursor changes to crosshair when hovering over the chart
19. Take a screenshot showing the active Horizontal Line tool

20. Click on the chart at a specific price level
21. **Verify** a horizontal line is drawn at the clicked price level
22. **Verify** a price label appears on the right side of the chart showing the price
23. Take a screenshot showing the horizontal line with price label
24. **Verify** the line extends across the full width of the chart

25. Click on the chart at another price level to add a second horizontal line
26. **Verify** a second horizontal line is created
27. Take a screenshot showing multiple horizontal lines
28. **Verify** each line has its own price label

### Test Keyboard Shortcuts for Tool Selection

29. Press the "Escape" key
30. **Verify** the Pointer tool is now selected
31. **Verify** the cursor returns to normal when hovering over the chart

32. Press the "H" key
33. **Verify** the Horizontal Line tool is selected
34. Take a screenshot showing tool selected via keyboard shortcut

35. Press the "T" key
36. **Verify** the Trendline tool is selected

37. Press the "F" key
38. **Verify** the Fibonacci tool is selected

39. Press "Escape" again
40. **Verify** the Pointer tool is selected again

### Test Trendline Drawing

41. Click on the "Trendline" button in the drawing toolbar
42. **Verify** the Trendline tool is selected
43. **Verify** a "Click to set end point" indicator appears after first click

44. Click on the chart at a starting point (e.g., a swing low)
45. **Verify** the pending drawing indicator shows "Click to set end point"
46. Take a screenshot showing the pending trendline state

47. Click on the chart at an ending point (e.g., a higher swing low)
48. **Verify** a trendline is drawn connecting the two points
49. Take a screenshot showing the completed trendline
50. **Verify** the pending indicator disappears

51. Press "Escape" key while in trendline mode without completing a trendline
52. **Verify** the pending drawing is cancelled

### Test Fibonacci Retracement Drawing

53. Click on the "Fibonacci" button in the drawing toolbar
54. **Verify** the Fibonacci tool is selected

55. Click on the chart at a swing low point
56. **Verify** the pending drawing indicator appears

57. Click on the chart at a swing high point
58. **Verify** Fibonacci retracement levels are drawn
59. Take a screenshot showing the Fibonacci retracement
60. **Verify** the following levels are displayed:
    - 0% level
    - 23.6% level
    - 38.2% level
    - 50% level
    - 61.8% level
    - 78.6% level
    - 100% level
61. **Verify** each level shows percentage and price labels

### Test Drawing Context Menu

62. Select the Pointer tool
63. Right-click on a horizontal line
64. **Verify** a context menu appears with options:
    - Edit
    - Duplicate
    - Use in Condition (for horizontal lines only)
    - Delete
65. Take a screenshot showing the horizontal line context menu

66. Click on "Edit" in the context menu
67. **Verify** the Drawing Properties dialog opens
68. **Verify** the dialog shows:
    - Color picker
    - Line Style dropdown (Solid, Dashed, Dotted)
    - Line Thickness slider
    - Label input field
    - Price Level input (for horizontal lines)
69. Take a screenshot showing the drawing properties dialog

70. Change the color to Red
71. Change the line style to Dashed
72. Enter a label "Support Level"
73. Click "Apply"
74. Take a screenshot showing the updated horizontal line
75. **Verify** the line is now red, dashed, and shows the custom label

### Test Drawing Duplication

76. Right-click on the styled horizontal line
77. Click on "Duplicate" in the context menu
78. **Verify** a new horizontal line is created at the same price level
79. **Verify** the duplicate has the same style but no label
80. Take a screenshot showing the duplicated line

### Test Use in Condition

81. Right-click on a horizontal line
82. Click on "Use in Condition" in the context menu
83. **Verify** a new condition is created in the Logic Panel
84. **Verify** the condition references the horizontal line price level
85. Take a screenshot showing the new condition in the Logic Panel
86. **Verify** the horizontal line shows a visual indicator (star icon) that it's used in a condition

### Test Condition-Linked Drawing Protection

87. Right-click on the horizontal line that is used in a condition
88. Click on "Delete" in the context menu
89. **Verify** a confirmation dialog appears
90. **Verify** the dialog warns about the condition being affected
91. Take a screenshot showing the deletion confirmation dialog
92. Click "Delete All" to confirm
93. **Verify** the horizontal line is deleted
94. **Verify** the related condition is also removed from the Logic Panel

### Test Drawing Limits

95. Add 20 horizontal lines to the chart
96. **Verify** the horizontal line count badge shows "20"
97. Try to add another horizontal line
98. **Verify** the action is prevented or a warning is shown
99. Take a screenshot showing the limit reached state
100. **Verify** the toolbar shows a warning indicator for horizontal lines

### Test Trendline Context Menu

101. Add a new trendline to the chart
102. Right-click on the trendline
103. **Verify** the context menu appears with:
    - Edit
    - Duplicate
    - Create Parallel
    - Delete
104. Take a screenshot showing the trendline context menu

105. Click on "Edit" in the context menu
106. **Verify** the dialog shows extend options:
    - Extend Left checkbox
    - Extend Right checkbox
107. Check "Extend Right"
108. Click "Apply"
109. **Verify** the trendline extends to the right edge of the chart
110. Take a screenshot showing the extended trendline

### Test Fibonacci Context Menu

111. Right-click on the Fibonacci retracement
112. **Verify** the context menu appears with:
    - Edit
    - Duplicate
    - Flip Direction
    - Delete
113. Take a screenshot showing the Fibonacci context menu

114. Click on "Edit" in the context menu
115. **Verify** the dialog shows level toggles for enabling/disabling specific levels
116. Toggle off the 23.6% and 78.6% levels
117. Toggle on the 127.2% extension level
118. Check "Show Prices"
119. Check "Show Percentages"
120. Click "Apply"
121. **Verify** the Fibonacci displays only the selected levels
122. Take a screenshot showing the customized Fibonacci levels

123. Right-click on the Fibonacci again
124. Click "Flip Direction"
125. **Verify** the Fibonacci levels are flipped (0% and 100% swap positions)
126. Take a screenshot showing the flipped Fibonacci

### Test Snap-to-Price Functionality

127. Select the Horizontal Line tool
128. Click near a candle's high or low price
129. **Verify** the line snaps to the exact high or low price
130. Take a screenshot showing the snapped line
131. **Verify** the price label shows the exact OHLC value

### Test Drawing Persistence

132. Take a screenshot showing all current drawings on the chart
133. Refresh the page
134. Wait for the page to reload
135. Click "Load Data" to reload the chart
136. **Verify** all drawings are restored from localStorage
137. Take a screenshot showing the restored drawings
138. **Verify** drawing properties (color, style, labels) are preserved

### Test Multiple Drawing Types Together

139. Ensure the chart has:
    - At least 2 horizontal lines (one used in condition)
    - At least 1 trendline with extension
    - At least 1 Fibonacci retracement
140. Take a final screenshot showing all drawing types together
141. **Verify** all drawings render correctly without overlap issues
142. **Verify** labels and annotations are readable

## Success Criteria

- Drawing toolbar is visible and functional with all tools
- Keyboard shortcuts (H, T, F, Escape) correctly select drawing tools
- Horizontal lines are drawn with single click at the clicked price level
- Trendlines require two clicks (start and end points)
- Fibonacci retracements require two clicks and display standard levels
- Context menu appears on right-click with appropriate options per drawing type
- Drawing Properties dialog allows editing color, style, thickness, and labels
- "Use in Condition" creates a condition referencing the horizontal line
- Condition-linked drawings show visual indicator and deletion protection
- Drawing limits are enforced (20 horizontal lines, 10 trendlines, 5 Fibonacci)
- Snap-to-price functionality snaps drawings to OHLC values
- Drawings persist across page refreshes via localStorage
- No JavaScript errors in console
- All screenshots captured successfully

## Notes

- Horizontal lines use paper coordinates for x-axis to span full chart width
- Trendlines and Fibonacci use data coordinates for accurate placement
- The crosshair cursor indicates an active drawing tool
- Pending drawing indicator helps users understand multi-click drawings
- Drawing IDs are used to link drawings with conditions
- Condition-linked drawings have special visual styling (glow effect, star icon)
