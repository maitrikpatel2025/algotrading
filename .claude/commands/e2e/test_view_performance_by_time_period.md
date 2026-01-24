# E2E Test: View Performance by Time Period

Test the Performance by Time Period functionality in Backtest Results including monthly performance table, day of week heatmap, hourly bar chart, best/worst highlighting, and CSV export features.

## User Story

As a trader
I want to see performance broken down by month, day of week, and hour
So that I can identify when my strategy performs best or worst

## Prerequisites

- At least one strategy exists with entry conditions defined
- At least one completed backtest with 10+ trades exists across multiple time periods

## Test Steps

### Setup: Navigate to Backtest with Results

1. Navigate to the `Application URL` (redirects to home page)
2. Take a screenshot of the initial state
3. **Verify** the page loads successfully

4. Click on "Backtest" in the navigation
5. Wait for backtests API response
6. Take a screenshot of the Backtest Library page
7. **Verify** page shows backtests

8. Click on a completed backtest with 10+ trades
9. Wait for navigation to backtest configuration page
10. **Verify** backtest results are displayed
11. Take a screenshot showing backtest results summary

### Test Performance by Time Period Section Display

12. Scroll down to locate Performance by Time Period section
13. **Verify** Performance by Time Period section header is visible with:
    - Calendar icon
    - "Performance by Time Period" label
    - Collapse/expand chevron icon
14. Take a screenshot of Performance by Time Period header

15. Click on Performance by Time Period header to expand the section (if collapsed)
16. **Verify** section expands to show time period content
17. Take a screenshot of expanded section

### Test Section Structure

18. **Verify** section contains three sub-sections:
    - Monthly Performance
    - Day of Week Analysis
    - Hour of Day Analysis
19. **Verify** "Export CSV" button is visible in section header
20. Take a screenshot of section structure

### Test Monthly Performance Table Display

21. Locate Monthly Performance sub-section
22. **Verify** Monthly Performance header is visible
23. **Verify** table has columns: Month, # Trades, Win Rate, Net P/L
24. Take a screenshot of monthly table headers

25. **Verify** at least one month row is displayed
26. **Verify** month is formatted readably (e.g., "Jan 2024")
27. **Verify** trade count is a positive integer
28. **Verify** win rate shows percentage (e.g., "65.5%")
29. **Verify** Net P/L shows currency value with + or -
30. Take a screenshot of monthly data rows

### Test Monthly Performance Best/Worst Highlighting

31. **Verify** best month row is highlighted with green styling (background or border)
32. **Verify** worst month row is highlighted with red styling (background or border)
33. **Verify** best month has highest Net P/L
34. **Verify** worst month has lowest Net P/L
35. Take a screenshot showing best/worst month highlighting

### Test Monthly Table Sorting

36. Click on "Month" column header
37. **Verify** months are sorted chronologically
38. **Verify** sort indicator appears
39. Take a screenshot of month sort

40. Click on "# Trades" column header
41. **Verify** rows are sorted by trade count
42. Take a screenshot of trade count sort

43. Click on "Win Rate" column header
44. **Verify** rows are sorted by win rate
45. Take a screenshot of win rate sort

46. Click on "Net P/L" column header
47. **Verify** rows are sorted by P/L value
48. Click again to sort descending
49. **Verify** most profitable month appears first
50. Take a screenshot of P/L descending sort

### Test Day of Week Heatmap Display

51. Locate Day of Week Analysis sub-section
52. **Verify** sub-section header shows "Day of Week Analysis"
53. **Verify** heatmap grid is visible
54. Take a screenshot of heatmap section

55. **Verify** heatmap has 7 columns for days (Monday through Sunday)
56. **Verify** heatmap has 24 rows for hours (0-23)
57. **Verify** day labels are visible at top (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
58. **Verify** hour labels are visible on the side (0, 1, 2, ... 23)
59. Take a screenshot of heatmap structure

### Test Heatmap Color Coding

60. **Verify** cells with positive P/L have green-ish color
61. **Verify** cells with negative P/L have red-ish color
62. **Verify** cells with no trades or zero P/L have neutral/gray color
63. **Verify** color intensity reflects magnitude of P/L
64. Take a screenshot of heatmap colors

### Test Heatmap Legend

65. **Verify** color legend is displayed near the heatmap
66. **Verify** legend shows gradient from loss (red) to profit (green)
67. **Verify** legend includes min and max P/L values
68. Take a screenshot of color legend

### Test Heatmap Tooltips

69. Hover over a heatmap cell with trades
70. **Verify** tooltip appears showing:
    - Day name (e.g., "Monday")
    - Hour (e.g., "09:00")
    - Net P/L value
    - Trade count
71. Take a screenshot of heatmap tooltip

72. Hover over different cells to verify tooltip updates
73. Take a screenshot of another tooltip

### Test Heatmap Best/Worst Highlighting

74. **Verify** best performing day-hour cell has distinct border (e.g., thicker green border)
75. **Verify** worst performing day-hour cell has distinct border (e.g., thicker red border)
76. Take a screenshot showing best/worst cell highlighting

### Test Day of Week Summary

77. **Verify** day of week summary is displayed showing:
    - Best day of week with name and P/L
    - Worst day of week with name and P/L
78. **Verify** best day is highlighted in green
79. **Verify** worst day is highlighted in red
80. Take a screenshot of day of week summary

### Test Hour of Day Bar Chart Display

81. Locate Hour of Day Analysis sub-section
82. **Verify** sub-section header shows "Hour of Day Analysis"
83. **Verify** bar chart is visible
84. Take a screenshot of hourly chart section

85. **Verify** chart shows 24 bars for hours 0-23
86. **Verify** hour labels are visible (0, 1, 2, ... 23)
87. **Verify** P/L values are displayed on or near bars
88. Take a screenshot of hourly bar chart

### Test Hourly Bar Chart Color Coding

89. **Verify** bars with positive P/L are green
90. **Verify** bars with negative P/L are red
91. **Verify** bars with zero P/L or no trades are neutral/gray
92. Take a screenshot of hourly bar colors

### Test Hourly Best/Worst Highlighting

93. **Verify** best hour bar has distinct styling (thicker border, glow, or label)
94. **Verify** worst hour bar has distinct styling
95. Take a screenshot showing best/worst hour highlighting

### Test Hourly Summary

96. **Verify** hourly summary is displayed showing:
    - Best hour with time and P/L
    - Worst hour with time and P/L
97. **Verify** best hour is highlighted in green
98. **Verify** worst hour is highlighted in red
99. Take a screenshot of hourly summary

### Test Export CSV Functionality

100. Locate "Export CSV" button in Performance by Time Period header
101. **Verify** button is visible and clickable
102. Take a screenshot of export button

103. Click on "Export CSV" button
104. **Verify** CSV file download initiates
105. **Verify** filename includes "time_period" or similar identifier
106. Take a screenshot after clicking export

107. Open the downloaded CSV file
108. **Verify** CSV contains "MONTHLY PERFORMANCE" section with columns:
    - Month, # Trades, Win Rate, Net P/L, Is Best, Is Worst
109. **Verify** CSV contains "DAY OF WEEK PERFORMANCE" section with columns:
    - Day, Day Name, # Trades, Win Rate, Net P/L, Is Best, Is Worst
110. **Verify** CSV contains "HOURLY PERFORMANCE" section with columns:
    - Hour, # Trades, Win Rate, Net P/L, Is Best, Is Worst
111. **Verify** data matches what's displayed in the UI
112. Take a screenshot of CSV file opened

### Test Section Collapse/Expand

113. Click on Performance by Time Period section header
114. **Verify** section collapses (hides all sub-sections)
115. **Verify** chevron icon changes to down arrow
116. Take a screenshot of collapsed state

117. Click on section header again
118. **Verify** section expands
119. **Verify** all sub-sections are visible again
120. Take a screenshot of re-expanded state

### Test Sub-Section Collapse/Expand

121. Click on Monthly Performance sub-section header
122. **Verify** monthly table collapses
123. Take a screenshot of collapsed monthly section

124. Click on Monthly Performance header again
125. **Verify** monthly table expands
126. Take a screenshot of expanded monthly section

127. Repeat collapse/expand test for Day of Week Analysis
128. Repeat collapse/expand test for Hour of Day Analysis
129. Take a screenshot showing mixed expanded/collapsed states

### Test Empty State: No Trades

130. If a backtest with 0 trades is available:
    - Navigate to that backtest
    - **Verify** Performance by Time Period section shows empty state
    - **Verify** message indicates "No trade data available" or similar
    - Take a screenshot of empty state

### Test Data Consistency

131. Compare monthly total trades with trade list total
132. **Verify** sum of monthly trades equals total backtest trades
133. Compare best/worst month P/L with trade list data
134. **Verify** highlighted months have correct P/L values
135. Take a screenshot confirming data consistency

### Test Responsive Design

136. Resize browser to tablet width (~768px)
137. **Verify** heatmap remains readable (may use smaller cells)
138. **Verify** tables remain usable with horizontal scroll if needed
139. **Verify** bar chart scales appropriately
140. Take a screenshot of tablet view

141. Resize browser to mobile width (<768px)
142. **Verify** components stack vertically
143. **Verify** heatmap is scrollable or uses alternative layout
144. **Verify** tables are scrollable horizontally
145. Take a screenshot of mobile view

146. Restore browser to desktop width

### Test Integration with Other Sections

147. **Verify** Performance by Time Period section appears after Risk Metrics
148. **Verify** Performance by Time Period section appears before Trade List
149. **Verify** section styling matches other collapsible sections
150. Take a screenshot showing section placement

### Final Validation

151. Expand Performance by Time Period section
152. **Verify** Monthly Performance table displays correctly with best/worst highlighting
153. **Verify** Day of Week heatmap renders with proper colors and tooltips
154. **Verify** Hour of Day bar chart shows all 24 hours
155. **Verify** All best/worst indicators are consistent
156. **Verify** Export CSV downloads complete time period data
157. **Verify** Section collapse/expand works smoothly
158. Take a final screenshot of complete Performance by Time Period view

## Success Criteria

- Performance by Time Period section appears in backtest results with calendar icon
- Section is collapsible/expandable with smooth animation
- Monthly Performance table displays columns: Month, # Trades, Win Rate, Net P/L
- Monthly table is sortable by clicking column headers
- Best month row is highlighted with green styling
- Worst month row is highlighted with red styling
- Day of Week heatmap displays 7 columns (days) x 24 rows (hours)
- Heatmap cells are color-coded by P/L intensity (green=profit, red=loss)
- Heatmap shows tooltips on hover with day, hour, P/L, trade count
- Heatmap includes color legend showing gradient scale
- Best/worst day-hour cells have distinct borders
- Day of week summary shows best/worst day with highlighting
- Hour of Day bar chart shows 24 bars for hours 0-23
- Hourly bars are color-coded (green for profit, red for loss)
- Best/worst hours have distinct styling
- Hourly summary shows best/worst hour with highlighting
- Export CSV button downloads CSV with three sections (Monthly, Day of Week, Hourly)
- CSV includes Is Best/Is Worst flags for each period
- Sub-sections can collapse/expand independently
- Empty state displays when no trade data available
- Data totals are consistent with trade list
- Responsive design works on tablet and mobile
- Section integrates correctly with existing backtest results layout
- 25+ screenshots are taken documenting the complete flow
