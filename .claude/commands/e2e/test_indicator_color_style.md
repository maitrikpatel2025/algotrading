# E2E Test: Indicator Color and Style Customization

Test the indicator styling controls for customizing line thickness, line style, and fill opacity in the Forex Trading Dashboard Strategy page.

## User Story

As a forex trader
I want to customize indicator colors, line thickness, and style
So that I can distinguish multiple indicators and match my visual preferences

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

### Test Line Thickness Control

11. Locate the "SMA" indicator in the Trend category
12. Drag the SMA indicator onto the chart
13. **Verify** the indicator settings dialog opens
14. Take a screenshot showing the settings dialog with styling controls
15. **Verify** the dialog contains:
    - Line Thickness section with 1px, 2px, 3px, 4px buttons
    - Line Style section with Solid, Dashed, Dotted buttons
    - Color selector
    - Period input field

16. Click the "3px" button in Line Thickness section
17. **Verify** the 3px button is highlighted as selected
18. Take a screenshot showing selected 3px line thickness
19. Select Orange color
20. Click "Add Indicator" button
21. **Verify** the dialog closes
22. **Verify** an "SMA (20)" badge appears in the active indicators section
23. Take a screenshot showing SMA with thick orange line on chart
24. **Verify** the SMA line appears thicker than default (approximately 3px wide)

### Test Line Style Control

25. Drag the "EMA" indicator onto the chart
26. **Verify** the settings dialog opens
27. Click the "Dashed" button in Line Style section
28. **Verify** the Dashed button is highlighted as selected
29. Take a screenshot showing dashed line style preview
30. Click the "2px" button in Line Thickness section
31. Select Blue color
32. Click "Add Indicator"
33. **Verify** an "EMA (20)" badge appears
34. Take a screenshot showing both SMA (solid thick orange) and EMA (dashed blue) on chart
35. **Verify** the EMA line appears with dashed style
36. **Verify** the two indicators are visually distinct

### Test Dotted Line Style

37. Drag another "EMA" indicator onto the chart
38. **Verify** the settings dialog opens
39. Change period to 50
40. Click the "Dotted" button in Line Style section
41. **Verify** the Dotted button is highlighted as selected
42. Click the "1px" button in Line Thickness section
43. Select Purple color
44. Click "Add Indicator"
45. **Verify** an "EMA (50)" badge appears
46. Take a screenshot showing SMA (solid thick), EMA (dashed), and EMA (dotted) on chart
47. **Verify** the EMA (50) line appears with dotted style
48. **Verify** all three indicators are easily distinguishable

### Test Fill Opacity Control (Bollinger Bands)

49. Drag the "Bollinger Bands" indicator onto the chart
50. **Verify** the settings dialog opens
51. **Verify** a "Fill Opacity" slider is visible (0-100%)
52. Take a screenshot showing the fill opacity slider
53. Drag the opacity slider to approximately 50%
54. **Verify** the opacity percentage updates to show ~50%
55. Click the "2px" button for line thickness
56. Click the "Solid" button for line style
57. Select Gray color
58. Click "Add Indicator"
59. **Verify** a "BB (20, 2)" badge appears
60. Take a screenshot showing Bollinger Bands with 50% fill opacity on chart
61. **Verify** the fill area between upper and lower bands is semi-transparent (approximately 50% opacity)
62. **Verify** the price chart is partially visible through the fill area

### Test Fill Opacity Edge Cases

63. Click on the "BB (20, 2)" badge to edit
64. **Verify** the settings dialog opens in edit mode
65. **Verify** the opacity slider shows the current value (~50%)
66. Drag the opacity slider all the way to 0%
67. **Verify** the opacity percentage shows 0%
68. Take a screenshot showing 0% opacity setting
69. Click "Apply"
70. Take a screenshot showing Bollinger Bands with 0% fill opacity
71. **Verify** the fill area is invisible (transparent)
72. **Verify** only the upper, middle, and lower band lines are visible

73. Click on the "BB (20, 2)" badge again to edit
74. Drag the opacity slider all the way to 100%
75. **Verify** the opacity percentage shows 100%
76. Click "Apply"
77. Take a screenshot showing Bollinger Bands with 100% fill opacity
78. **Verify** the fill area is completely opaque (solid color)
79. **Verify** the price chart is not visible through the fill area

### Test Reset to Default

80. Click on the "SMA (20)" badge to edit
81. **Verify** the settings dialog opens showing current styling (3px, solid, orange)
82. Click the "Reset to Default" button
83. **Verify** all styling properties reset:
    - Line thickness resets to default (1.5px or similar)
    - Line style resets to Solid
    - Color resets to default blue (#3B82F6)
    - Period resets to 20
84. Take a screenshot showing reset styling values
85. Click "Apply"
86. Take a screenshot showing SMA with default styling on chart
87. **Verify** the SMA line returns to default appearance

### Test Real-Time Preview with Styling

88. Click on the "EMA (20)" badge to edit
89. **Verify** the settings dialog opens in edit mode with comparison mode toggle visible
90. Click "Compare Before/After" button
91. **Verify** both the original indicator and preview indicator are visible on chart
92. Click the "4px" button for line thickness
93. Wait 200ms for debounced preview update
94. Take a screenshot showing before/after comparison with different line thickness
95. **Verify** the preview indicator shows 4px thickness (dashed line)
96. **Verify** the original indicator shows current thickness (solid line)
97. Change color to Red
98. Wait 200ms for debounced preview update
99. Take a screenshot showing before/after comparison with different color and thickness
100. **Verify** the preview indicator is visually distinct from the original

101. Click the "Dotted" button for line style
102. Wait 200ms for debounced preview update
103. Take a screenshot showing preview with dotted style
104. **Verify** the preview indicator shows dotted line style
105. Click "Apply"
106. **Verify** the indicator updates with new styling
107. Take a screenshot showing final updated indicator styling

### Test Keltner Channel Fill Opacity

108. Drag the "Keltner Channel" indicator onto the chart
109. **Verify** the settings dialog opens
110. **Verify** a "Fill Opacity" slider is visible
111. Set opacity to 30%
112. Click the "2px" button for line thickness
113. Click the "Dashed" button for line style
114. Select Cyan color
115. Click "Add Indicator"
116. **Verify** a "KC (20, 2)" badge appears
117. Take a screenshot showing Keltner Channel with custom styling
118. **Verify** the fill area has approximately 30% opacity
119. **Verify** the channel lines are dashed with 2px thickness

### Test Styling Persistence

120. Take a final screenshot showing all indicators with custom styling
121. **Verify** the following indicators are visible with custom styling:
    - SMA (20) with default styling (after reset)
    - EMA (20) with 4px, dotted, red
    - EMA (50) with 1px, dotted, purple
    - BB (20, 2) with 100% fill opacity, 2px, solid, gray
    - KC (20, 2) with 30% fill opacity, 2px, dashed, cyan

122. **Verify** all indicators maintain their custom styling throughout the session
123. **Verify** all indicators are easily distinguishable from each other

## Success Criteria

- Line thickness options (1px, 2px, 3px, 4px) are available and functional
- Line thickness selection renders correctly on chart for all indicator types
- Line style options (Solid, Dashed, Dotted) are available and functional
- Line style selection renders correctly on chart using Plotly dash property
- Opacity slider (0-100%) is available for Bollinger Bands and Keltner Channel
- Opacity slider correctly controls fill transparency on chart
- Fill opacity at 0% makes fill invisible, at 100% makes fill completely opaque
- "Reset to Default" button restores all styling properties to indicator defaults
- Real-time preview shows styling changes with debouncing
- Comparison mode displays before/after styling changes side by side
- Multiple indicators can have distinct styling to aid visual differentiation
- All styling properties persist throughout the session
- UI controls are intuitive and responsive
- No JavaScript errors in console
- All screenshots captured successfully

## Notes

- Line thickness should be visually distinguishable on the chart (1px = thin, 4px = thick)
- Dashed line style should show clear gaps between dashes
- Dotted line style should show clear dots along the line
- Fill opacity should smoothly transition from invisible (0%) to opaque (100%)
- Preview mode styling (dashed lines, reduced opacity) should not interfere with custom line styling
- The opacity slider should show the current percentage value as the user drags it
