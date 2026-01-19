# E2E Test: Indicator Click Configuration

Test the click-to-configure functionality for indicators on the chart, allowing users to click directly on indicator lines/areas to open the configuration modal, and right-click for context menu actions.

## User Story

As a forex trader
I want to click on an indicator line/area on the chart to open its configuration modal
So that I can easily access and modify indicator parameters without searching for badges

## Prerequisites

- Application is running at the Application URL
- Price data is loaded on the Strategy page
- At least 2-3 indicators are active on the chart

## Test Steps

### Setup: Load Strategy Page with Indicators

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

### Add Test Indicators

11. Drag "SMA" indicator from Trend category onto the chart
12. In the settings dialog, set period to 20 and select blue color
13. Click "Add Indicator"
14. **Verify** SMA (20) appears on the chart and in the active indicators section
15. Take a screenshot showing SMA on the chart

16. Drag "EMA" indicator onto the chart
17. Set period to 50 and select orange color
18. Click "Add Indicator"
19. **Verify** EMA (50) appears on the chart and in the active indicators section

20. Drag "RSI" indicator from Momentum category onto the chart
21. Set period to 14 and select purple color
22. Click "Add Indicator"
23. **Verify** RSI (14) appears in a subchart below the main chart
24. Take a screenshot showing all three indicators (SMA, EMA overlay, RSI subchart)

### Test Left-Click on Overlay Indicator (SMA)

25. Hover over the SMA line on the chart
26. **Verify** hover tooltip appears showing SMA value
27. Click directly on the SMA line
28. **Verify** the indicator settings dialog opens
29. **Verify** the dialog shows "Edit SMA" title
30. **Verify** the period field is pre-populated with 20
31. **Verify** the current color (blue) is selected
32. Take a screenshot showing the edit dialog opened from clicking the line

33. Change the period to 30
34. Select green color
35. Click "Update" button
36. **Verify** the dialog closes
37. **Verify** the SMA badge now shows "SMA (30)"
38. **Verify** the SMA line is now green on the chart
39. Take a screenshot showing the updated SMA

### Test Left-Click on Different Overlay Indicator (EMA)

40. Click directly on the EMA line on the chart
41. **Verify** the indicator settings dialog opens for EMA
42. **Verify** the dialog shows "Edit EMA" title
43. **Verify** the period field is pre-populated with 50
44. Take a screenshot showing EMA edit dialog

45. Change the period to 100
46. Click "Update"
47. **Verify** the badge now shows "EMA (100)"
48. Take a screenshot showing the updated EMA

### Test Left-Click on Subchart Indicator (RSI)

49. Scroll down if needed to see the RSI subchart
50. Click directly on the RSI line in the subchart
51. **Verify** the indicator settings dialog opens for RSI
52. **Verify** the dialog shows "Edit RSI" title
53. **Verify** the period field is pre-populated with 14
54. Take a screenshot showing RSI edit dialog

55. Change the period to 21
56. Click "Update"
57. **Verify** the badge now shows "RSI (21)"
58. Take a screenshot showing the updated RSI

### Test Right-Click Context Menu on Overlay Indicator

59. Right-click directly on the SMA line on the chart
60. **Verify** a context menu appears near the click point
61. **Verify** the context menu shows the indicator name "SMA (30)" at the top
62. **Verify** the context menu has three options:
    - Configure (with Settings icon)
    - Duplicate (with Copy icon)
    - Remove (with X icon, red text)
63. Take a screenshot showing the context menu

64. Click outside the context menu (on the chart background)
65. **Verify** the context menu closes without taking any action
66. **Verify** the SMA indicator remains on the chart

### Test Context Menu: Configure Action

67. Right-click on the EMA line
68. **Verify** the context menu appears
69. Click "Configure" option in the context menu
70. **Verify** the context menu closes
71. **Verify** the indicator settings dialog opens for EMA
72. **Verify** the dialog shows current EMA parameters (period: 100)
73. Take a screenshot showing the settings dialog opened from context menu

74. Click "Cancel" to close the dialog without changes

### Test Context Menu: Duplicate Action

75. Right-click on the SMA line
76. **Verify** the context menu appears
77. Click "Duplicate" option in the context menu
78. **Verify** the context menu closes
79. **Verify** a new SMA indicator appears on the chart with the same parameters (period: 30, green color)
80. **Verify** two "SMA (30)" badges appear in the active indicators section
81. **Verify** a new condition is automatically created for the duplicated indicator
82. Take a screenshot showing the duplicated SMA indicator and badges

### Test Context Menu: Remove Action

83. Count the current number of SMA indicators (should be 2 after duplication)
84. Right-click on one of the SMA lines
85. **Verify** the context menu appears
86. Click "Remove" option in the context menu
87. **Verify** the context menu closes
88. **Verify** one SMA indicator is removed from the chart
89. **Verify** only one "SMA (30)" badge remains in the active indicators section
90. Take a screenshot showing one SMA removed

### Test Context Menu on Subchart Indicator

91. Right-click on the RSI line in the subchart
92. **Verify** the context menu appears positioned near the RSI subchart
93. **Verify** the context menu shows "RSI (21)" as the indicator name
94. Take a screenshot showing context menu on subchart indicator

95. Click "Duplicate" option
96. **Verify** a second RSI subchart appears below the first one
97. **Verify** two "RSI (21)" badges appear
98. Take a screenshot showing duplicated RSI subchart

### Test Context Menu Positioning at Viewport Edges

99. Zoom in on the chart to make it larger
100. Scroll to position an indicator line near the right edge of the screen
101. Right-click on the indicator near the right edge
102. **Verify** the context menu appears but stays within the viewport (doesn't go off-screen right)
103. Take a screenshot showing context menu positioning adjustment

104. Scroll to position an indicator near the bottom of the viewport
105. Right-click on the indicator near the bottom edge
106. **Verify** the context menu repositions to stay within the viewport (doesn't go off-screen bottom)
107. Take a screenshot showing context menu positioning at bottom edge

### Test Escape Key to Close Context Menu

108. Right-click on any indicator to open the context menu
109. **Verify** the context menu is open
110. Press the Escape key
111. **Verify** the context menu closes without taking any action
112. **Verify** the indicator remains on the chart

### Test Click-to-Configure with Multiple Instances

113. Verify there are two RSI indicators in subcharts (from earlier duplication)
114. Click on the RSI line in the first subchart
115. **Verify** the settings dialog opens for that specific RSI instance
116. Note the instance ID or position
117. Click "Cancel"

118. Click on the RSI line in the second subchart
119. **Verify** the settings dialog opens for the second RSI instance
120. **Verify** it's a different instance (by instance ID or context)
121. Take a screenshot showing the ability to configure multiple instances separately

### Test Interaction Doesn't Interfere with Chart Controls

122. Test that clicking on the chart background (not on an indicator) doesn't open any dialog
123. **Verify** normal chart interactions still work:
    - Pan by dragging on empty chart area
    - Zoom using scroll wheel
    - Double-click to reset zoom
124. Take a screenshot showing normal chart interactions work

125. Click on an indicator line again
126. **Verify** the click-to-configure functionality still works after chart interactions

### Test Add Bollinger Bands (Multi-Line Indicator)

127. Drag "Bollinger Bands" indicator onto the chart
128. Set period to 20, standard deviation to 2
129. Click "Add Indicator"
130. **Verify** Bollinger Bands (upper, middle, lower bands) appear on the chart
131. Take a screenshot showing Bollinger Bands

132. Click on any of the Bollinger Bands lines (upper, middle, or lower)
133. **Verify** the settings dialog opens for Bollinger Bands
134. **Verify** the dialog shows both period (20) and standard deviation (2)
135. Take a screenshot showing BB configuration from line click

### Test MACD in Subchart (Complex Multi-Line Indicator)

136. Drag "MACD" indicator onto the chart
137. Use default parameters (Fast: 12, Slow: 26, Signal: 9)
138. Click "Add Indicator"
139. **Verify** MACD indicator appears in a subchart with three components:
    - MACD line
    - Signal line
    - Histogram
140. Take a screenshot showing MACD

141. Click on any MACD component (line or histogram bar)
142. **Verify** the settings dialog opens for MACD
143. **Verify** all three period fields are pre-populated with current values
144. Take a screenshot showing MACD configuration from line click

### Test Context Menu with Condition Dependencies

145. Verify that indicators have associated conditions in the Logic Panel
146. Right-click on an indicator that has a condition
147. Click "Remove" from the context menu
148. **Verify** a confirmation dialog appears asking about related conditions
149. **Verify** options are provided to "Remove All" or "Keep Conditions"
150. Take a screenshot showing the confirmation dialog

151. Click "Keep Conditions"
152. **Verify** the indicator is removed from the chart
153. **Verify** the condition remains in the Logic Panel

## Success Criteria

- Clicking on an indicator line/band opens the configuration modal in edit mode
- Modal displays the indicator name, description, and all configurable parameters
- Current parameter values are pre-populated in form fields
- Modal can be closed by clicking Cancel, clicking outside, or pressing Escape
- Right-clicking an indicator shows a context menu near the click point
- Context menu displays:
  - Indicator name header
  - Configure option (opens settings dialog)
  - Remove option (removes indicator with confirmation if needed)
  - Duplicate option (creates new instance with same parameters)
- Context menu closes when:
  - Clicking outside the menu
  - Pressing Escape key
  - Clicking a menu action
- Context menu positioning stays within viewport bounds (no off-screen rendering)
- Feature works for both overlay indicators (SMA, EMA, BB) and subchart indicators (RSI, MACD)
- Feature works with multiple instances of the same indicator type
- Clicking on different lines of multi-line indicators (BB, MACD) opens the correct indicator's settings
- Duplicate action creates a new instance with the same parameters but a unique instance ID
- Duplicate action auto-creates a condition for the new instance
- Click-to-configure doesn't interfere with normal chart interactions (zoom, pan, drag)
- Visual feedback (hover states) indicates indicators are interactive
- 20+ screenshots are taken documenting the full test flow including edge cases
