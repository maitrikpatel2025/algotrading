# E2E Test: Candle Close Confirmation

Test the candle close confirmation toggle feature that allows traders to choose whether their entry signals should trigger immediately on real-time price data or wait for the candle to close before evaluating conditions.

## User Story

As a forex trader
I want to choose whether signals trigger immediately or wait for candle close
So that I can control signal reliability vs. entry speed based on my strategy style

## Prerequisites

- Application is running at the Application URL
- Strategy page is accessible

## Test Steps

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Take a screenshot of the initial state (Monitor page)
3. **Verify** the page loads successfully

4. Click on "Strategy" in the navigation
5. Take a screenshot of the Strategy page
6. **Verify** the Strategy page loads with indicator library panel visible on the left
7. **Verify** the Logic Panel is visible on the right side of the page

### Test Candle Close Toggle Visibility

8. Locate the Controls Card with Pair and Timeframe selectors
9. Take a screenshot showing the Candle Close Toggle
10. **Verify** the Candle Close Toggle is displayed in the Controls Card
11. **Verify** the label "Confirm on Candle Close" is visible above the toggle
12. **Verify** two options are visible: "Yes - Wait for close" with clock icon, "No - Real-time" with zap icon
13. **Verify** the default selection is "Yes - Wait for close" (highlighted in blue)

### Test Default State (Yes - Wait for close)

14. **Verify** the "Yes - Wait for close" button shows a clock icon
15. **Verify** the "Yes - Wait for close" button has blue background color
16. **Verify** the "No - Real-time" button is not highlighted (has default/muted styling)
17. Take a screenshot showing default Yes state active

### Test Strategy Summary Indicator (Default State)

18. **Verify** the strategy summary section shows "Signals confirmed on candle close" text
19. **Verify** a blue clock icon appears next to the confirmation status text
20. Take a screenshot showing the strategy summary with candle close confirmation indicator

### Test Switching to Real-time Mode

21. Click on "No - Real-time" button in the Candle Close Toggle
22. Take a screenshot showing the toggle with Real-time mode active
23. **Verify** the "No - Real-time" button is highlighted in amber/yellow color
24. **Verify** the "No - Real-time" button shows a zap/lightning icon
25. **Verify** the "Yes - Wait for close" button is no longer highlighted (has default/muted styling)

### Test Strategy Summary Updates (Real-time Mode)

26. **Verify** the strategy summary section updates to show "Real-time signal evaluation" text
27. **Verify** an amber/yellow zap icon appears next to the real-time status text
28. Take a screenshot showing the strategy summary with real-time evaluation indicator

### Test Switching Back to Candle Close Mode

29. Click on "Yes - Wait for close" button
30. Take a screenshot showing toggle switched back to Yes mode
31. **Verify** the "Yes - Wait for close" button is highlighted in blue
32. **Verify** the strategy summary shows "Signals confirmed on candle close" again
33. **Verify** the blue clock icon is displayed in the summary

### Test Tooltips on Toggle Buttons

34. Hover over the "Yes - Wait for close" button
35. Take a screenshot showing the tooltip
36. **Verify** a tooltip appears explaining: "Yes - Wait for candle close: Conditions only evaluate as true after the candle closes. Reduces false signals but may delay entries."
37. Hover over the "No - Real-time" button
38. Take a screenshot showing the No button tooltip
39. **Verify** a tooltip appears explaining: "No - Real-time: Conditions evaluate on each tick as prices update. Faster entries but may result in more false signals."

### Test Label Tooltip

40. Hover over the "Confirm on Candle Close" label
41. **Verify** a tooltip appears with text: "Waiting for candle close reduces false signals but may delay entries"
42. Take a screenshot showing the label tooltip

### Test Persistence Across Page Reload (Yes Mode)

43. Ensure toggle is set to "Yes - Wait for close" (blue highlighted)
44. Take a screenshot showing Yes mode before reload
45. Refresh the browser page (F5 or reload button)
46. Wait for page to fully load
47. Take a screenshot after page reload
48. **Verify** the toggle is still set to "Yes - Wait for close" (persisted from localStorage)
49. **Verify** the "Yes - Wait for close" button is highlighted in blue
50. **Verify** the strategy summary shows "Signals confirmed on candle close"

### Test Persistence Across Page Reload (No Mode)

51. Click on "No - Real-time" button to switch to real-time mode
52. Take a screenshot showing No mode active
53. Refresh the browser page (F5 or reload button)
54. Wait for page to fully load
55. Take a screenshot after page reload
56. **Verify** the toggle is still set to "No - Real-time" (persisted from localStorage)
57. **Verify** the "No - Real-time" button is highlighted in amber
58. **Verify** the strategy summary shows "Real-time signal evaluation"

### Test Keyboard Accessibility

59. Click outside the candle close toggle to unfocus
60. Press Tab key until the Candle Close Toggle is focused
61. **Verify** the first toggle button receives focus (visible focus ring)
62. Take a screenshot showing keyboard focus on toggle button
63. Press Tab key to move to the next button
64. **Verify** focus moves to the other toggle button
65. Press Enter key
66. **Verify** the toggle selection changes
67. Take a screenshot after keyboard toggle
68. Press Space key
69. **Verify** the toggle selection changes again
70. Take a screenshot after space key toggle

### Test Toggle Works Alongside Trade Direction

71. Set candle close toggle to "Yes - Wait for close"
72. Set trade direction to "Long Only" (click the Long Only button)
73. Take a screenshot showing both settings configured
74. **Verify** both the Trade Direction Selector and Candle Close Toggle maintain their states
75. **Verify** Trade Direction shows "Long Only" highlighted in green
76. **Verify** Candle Close shows "Yes - Wait for close" highlighted in blue
77. Switch candle close to "No - Real-time"
78. **Verify** Trade Direction remains "Long Only" (unchanged)
79. **Verify** Candle Close shows "No - Real-time" highlighted in amber
80. Take a screenshot showing independent toggle behavior

### Test Mobile Responsiveness (Resize Browser)

81. Resize browser to mobile width (< 768px)
82. Take a screenshot of mobile layout
83. **Verify** the Candle Close Toggle is visible
84. **Verify** toggle buttons are properly sized for touch targets (at least 44x44 pixels)
85. **Verify** buttons may stack or wrap if needed for mobile layout
86. Click on a toggle button on mobile
87. **Verify** the button responds to touch/click
88. Take a screenshot showing mobile toggle interaction
89. Resize browser back to desktop width

### Test Visual Consistency

90. Take a screenshot of the full Controls Card showing all selectors
91. **Verify** the Candle Close Toggle is positioned after the Trade Direction Selector
92. **Verify** the toggle buttons have consistent sizing with other controls
93. **Verify** the label styling matches other control labels in the card

### Test Data Loading with Toggle Settings

94. Click "Load Data" button to load price data
95. Wait for chart to render with price data
96. Take a screenshot showing chart with data loaded
97. **Verify** the candle close confirmation setting is still displayed in the strategy summary
98. **Verify** the toggle state persists after loading data
99. Switch toggle to opposite setting
100. **Verify** the strategy summary updates immediately without needing to reload data

## Success Criteria

- Candle Close Toggle is displayed in the Controls Card with label "Confirm on Candle Close"
- Two options available: "Yes - Wait for close" (clock icon) and "No - Real-time" (zap icon)
- Default selection is "Yes - Wait for close" for new sessions
- "Yes" button highlighted in blue when active
- "No" button highlighted in amber/yellow when active
- Strategy summary shows appropriate indicator:
  - Clock icon + "Signals confirmed on candle close" when Yes is selected
  - Zap icon + "Real-time signal evaluation" when No is selected
- Tooltips provide helpful explanations for each option
- Setting persists across page reloads via localStorage
- Toggle works independently of Trade Direction setting
- Keyboard navigation works (Tab, Enter, Space)
- Mobile layout is responsive and touch-friendly
- Toggle positioned consistently in Controls Card layout
- 25+ screenshots documenting the full test flow
