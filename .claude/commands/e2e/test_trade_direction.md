# E2E Test: Set Trade Direction

Test the trade direction selector feature that allows traders to specify whether their strategy trades Long only, Short only, or Both directions.

## User Story

As a forex trader
I want to specify whether my strategy trades Long only, Short only, or Both directions
So that I can build strategies focused on my preferred trading style and see only relevant condition sections

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

### Test Trade Direction Selector Visibility

8. Locate the Controls Card with Pair and Timeframe selectors
9. Take a screenshot showing the Trade Direction Selector
10. **Verify** the Trade Direction Selector is prominently displayed in the Controls Card
11. **Verify** three options are visible: "↑ Long Only", "↓ Short Only", "↕ Both"
12. **Verify** the default selection is "↕ Both" (highlighted in blue)

### Test Default State (Both Directions)

13. Click "Load Data" button to load price data
14. Wait for chart to render with price data
15. Take a screenshot showing the chart with data loaded
16. **Verify** the Logic Panel shows both "Entry Conditions" and "Exit Conditions" sections

### Test Long Only Direction

17. Click on "↑ Long Only" button in the Trade Direction Selector
18. Take a screenshot showing the selector with Long Only active
19. **Verify** the "↑ Long Only" button is highlighted in green
20. **Verify** the Logic Panel shows ONLY the "Entry Conditions" section
21. **Verify** the "Exit Conditions" section is hidden
22. **Verify** the selection persists visually (green background on Long Only button)

### Test Adding Indicator in Long Only Mode

23. Drag and drop "SMA" indicator onto the chart
24. Wait for indicator settings dialog to appear
25. Click "Apply" to add the indicator with default settings
26. Take a screenshot showing SMA condition block created
27. **Verify** a condition block appears in the "Entry Conditions" section
28. **Verify** the condition shows "Close Price crosses above SMA (20)" or similar
29. **Verify** NO "Exit Conditions" section is visible

### Test Short Only Direction

30. Click on "↓ Short Only" button in the Trade Direction Selector
31. **Verify** a confirmation dialog appears with message about removing entry conditions
32. Take a screenshot showing the confirmation dialog
33. **Verify** the message states "You have 1 Entry condition defined. Switching to Short Only will remove it. Continue?"
34. Click "Continue" button in the confirmation dialog
35. Take a screenshot showing Short Only mode active
36. **Verify** the "↓ Short Only" button is highlighted in red
37. **Verify** the SMA condition block is removed from the Logic Panel
38. **Verify** the Logic Panel shows ONLY the "Exit Conditions" section
39. **Verify** the "Entry Conditions" section is hidden
40. **Verify** the SMA indicator REMAINS visible on the chart

### Test Adding Indicator in Short Only Mode

41. Drag and drop "EMA" indicator onto the chart
42. Wait for indicator settings dialog to appear
43. Click "Apply" to add the indicator with default settings
44. Take a screenshot showing EMA condition block created
45. **Verify** a condition block appears in the "Exit Conditions" section
46. **Verify** the condition shows "Close Price crosses below EMA (20)" or similar
47. **Verify** NO "Entry Conditions" section is visible

### Test Switching Back to Both Directions

48. Click on "↕ Both" button in the Trade Direction Selector
49. Take a screenshot showing Both mode active
50. **Verify** the "↕ Both" button is highlighted in blue
51. **Verify** the Logic Panel shows BOTH "Entry Conditions" and "Exit Conditions" sections
52. **Verify** the EMA condition block is still in the "Exit Conditions" section
53. **Verify** the "Entry Conditions" section is empty (condition was removed earlier)

### Test Confirmation Dialog Cancel

54. Drag and drop "RSI" indicator onto the chart to create an entry condition
55. Wait for indicator settings dialog, click "Apply"
56. Take a screenshot showing RSI entry condition created
57. **Verify** RSI condition appears in "Entry Conditions" section
58. Click on "↓ Short Only" button
59. **Verify** confirmation dialog appears about removing entry condition(s)
60. Click "Cancel" button in the confirmation dialog
61. Take a screenshot after canceling
62. **Verify** the trade direction remains "↕ Both"
63. **Verify** the RSI condition block REMAINS in the Entry Conditions section
64. **Verify** both Entry and Exit sections are still visible

### Test Multiple Conditions Removal

65. Drag and drop "MACD" indicator onto the chart to create another entry condition
66. Wait for indicator settings dialog, click "Apply"
67. Take a screenshot showing two entry conditions (RSI and MACD)
68. Click on "↓ Short Only" button
69. **Verify** confirmation dialog states "You have 2 Entry conditions defined. Switching to Short Only will remove them. Continue?"
70. Take a screenshot of the confirmation dialog with count
71. Click "Continue" button
72. **Verify** both RSI and MACD condition blocks are removed
73. **Verify** only "Exit Conditions" section is visible
74. **Verify** RSI and MACD indicators REMAIN visible on the chart

### Test Persistence Across Page Reload

75. Ensure trade direction is set to "↓ Short Only" (red highlighted)
76. Take a screenshot showing Short Only mode
77. Refresh the browser page (F5 or reload button)
78. Wait for page to load
79. Take a screenshot after page reload
80. **Verify** the trade direction is still "↓ Short Only" (persisted from localStorage)
81. **Verify** only "Exit Conditions" section is visible in Logic Panel
82. **Verify** the "↓ Short Only" button is highlighted in red

### Test Switching from Long to Short (No Confirmation)

83. Click on "↑ Long Only" button
84. **Verify** confirmation dialog appears (we have exit condition from EMA)
85. Click "Continue" to switch
86. Take a screenshot showing Long Only mode
87. **Verify** "Entry Conditions" section is visible, "Exit Conditions" section is hidden
88. Click on "↓ Short Only" button
89. **Verify** NO confirmation dialog appears (no entry conditions to remove)
90. Take a screenshot showing Short Only mode
91. **Verify** direction switches immediately to "↓ Short Only"
92. **Verify** "Exit Conditions" section is visible, "Entry Conditions" section is hidden

### Test Visual Indicators and Icons

93. Click on "↑ Long Only" button (accept confirmation if shown)
94. Take a screenshot showing Long Only active
95. **Verify** the icon "↑" is displayed on the Long Only button
96. **Verify** the button has green background color
97. **Verify** button text shows "Long Only"
98. Click on "↓ Short Only" button (accept confirmation if shown)
99. Take a screenshot showing Short Only active
100. **Verify** the icon "↓" is displayed on the Short Only button
101. **Verify** the button has red background color
102. **Verify** button text shows "Short Only"
103. Click on "↕ Both" button
104. Take a screenshot showing Both active
105. **Verify** the icon "↕" is displayed on the Both button
106. **Verify** the button has blue background color
107. **Verify** button text shows "Both"

### Test Keyboard Accessibility

108. Click outside the trade direction selector to unfocus
109. Press Tab key until the Trade Direction Selector is focused
110. **Verify** the first direction button receives focus (visible focus ring)
111. Press Enter or Space key
112. **Verify** the trade direction changes
113. Press Escape key if confirmation dialog appears
114. **Verify** the confirmation dialog closes

### Test Tooltips

115. Hover over the "↑ Long Only" button
116. Take a screenshot showing the tooltip
117. **Verify** a tooltip appears with text "Long Only: Strategy will only enter buy positions (betting price goes up)"
118. Hover over the "↓ Short Only" button
119. **Verify** tooltip shows "Short Only: Strategy will only enter sell positions (betting price goes down)"
120. Hover over the "↕ Both" button
121. **Verify** tooltip shows "Both: Strategy can enter both buy and sell positions"

### Test Mobile Responsiveness (Resize Browser)

122. Resize browser to mobile width (< 768px)
123. Take a screenshot of mobile layout
124. **Verify** the Trade Direction Selector buttons are visible
125. **Verify** buttons are properly sized for touch targets (at least 44x44 pixels)
126. **Verify** buttons may stack vertically if needed for mobile layout
127. Click on a direction button on mobile
128. **Verify** the button responds to touch/click
129. **Verify** confirmation dialog (if shown) is mobile-friendly and readable

## Success Criteria

- Trade Direction Selector is prominently displayed in the Controls Card
- Three options are available: "Long Only" (↑), "Short Only" (↓), "Both" (↕)
- Default selection is "Both" for new sessions
- Changing direction updates Logic Panel sections immediately:
  - "Long Only" shows Entry Conditions section only
  - "Short Only" shows Exit Conditions section only
  - "Both" shows both Entry and Exit sections
- Confirmation dialog appears when switching from "Both" to single direction with existing incompatible conditions
- Dialog message clearly indicates which conditions will be removed
- User can confirm or cancel the change
- Trade Direction persists across page reloads (via localStorage)
- Icons (↑, ↓, ↕) are displayed correctly for each option
- Color coding is consistent:
  - Long (↑) - Green
  - Short (↓) - Red
  - Both (↕) - Blue
- Auto-created conditions respect the current trade direction
- Indicators remain on chart when conditions are removed due to direction change
- Keyboard navigation works (Tab, Enter, Space, Escape)
- Tooltips provide helpful explanations for each direction
- Mobile layout is responsive and touch-friendly
- 30+ screenshots documenting the full test flow
