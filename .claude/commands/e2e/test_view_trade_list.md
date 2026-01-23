# E2E Test: View Trade List

Test the Trade List functionality in Backtest Results including table display, sorting, filtering, pagination, CSV export, and chart highlighting features.

## User Story

As a trader
I want to see a detailed list of all trades from the backtest
So that I can analyze individual trade performance

## Prerequisites

- At least one strategy exists with entry conditions defined
- At least one completed backtest with 10+ trades exists

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

### Test Trade List Section Display

12. Scroll down to locate Trade List section
13. **Verify** Trade List section header is visible with:
    - "Trade List" label
    - Trade count badge (e.g., "10 trades")
    - Collapse/expand chevron icon
14. Take a screenshot of Trade List header

15. Click on Trade List header to expand the section
16. **Verify** section expands to show trade list content
17. Take a screenshot of expanded trade list section

### Test Trade List Table Structure

18. **Verify** trade table is visible with the following columns:
    - # (Trade number)
    - Entry Date
    - Exit Date
    - Direction
    - Entry Price
    - Exit Price
    - Size
    - P/L ($)
    - P/L (%)
    - Duration
    - Exit Reason
19. Take a screenshot of table headers

20. **Verify** at least one trade row is displayed
21. **Verify** trade number starts at 1
22. **Verify** entry and exit dates are formatted (e.g., "Jan 15, 2024 09:30")
23. **Verify** direction shows "Long" or "Short" with icon
24. **Verify** prices show 5 decimal places
25. **Verify** P/L ($) shows + for profits, - for losses
26. **Verify** P/L (%) shows percentage with + or -
27. **Verify** duration is human-readable (e.g., "2h 15m")
28. **Verify** exit reason is formatted (e.g., "Stop Loss", "Take Profit")
29. Take a screenshot of trade table with data

### Test Filter Controls Display

30. **Verify** filter controls section is visible above the table
31. **Verify** "Filters" label is displayed with filter icon
32. **Verify** Outcome filter shows three options: All | Winners | Losers
33. **Verify** Direction filter shows three options: Both | Long | Short
34. **Verify** Start Date picker is visible
35. **Verify** End Date picker is visible
36. Take a screenshot of filter controls

### Test Outcome Filter: All Trades

37. **Verify** "All" outcome filter is selected by default
38. Count the number of trades displayed
39. Record the count for comparison
40. Take a screenshot showing all trades

### Test Outcome Filter: Winners Only

41. Click on "Winners" outcome filter button
42. Wait for table to update
43. **Verify** "Winners" button is highlighted/active
44. **Verify** only trades with positive P/L are displayed
45. **Verify** all displayed trades show green P/L values
46. **Verify** active filter count badge shows "1"
47. Take a screenshot of winners-only view

### Test Outcome Filter: Losers Only

48. Click on "Losers" outcome filter button
49. Wait for table to update
50. **Verify** "Losers" button is highlighted/active
51. **Verify** only trades with negative P/L are displayed
52. **Verify** all displayed trades show red P/L values
53. Take a screenshot of losers-only view

### Test Direction Filter: All Directions

54. Click on "All" outcome filter to reset
55. **Verify** "Both" direction filter is selected by default
56. Take a screenshot showing both long and short trades

### Test Direction Filter: Long Only

57. Click on "Long" direction filter button
58. Wait for table to update
59. **Verify** "Long" button is highlighted/active
60. **Verify** only trades with "Long" direction are displayed
61. **Verify** active filter count badge updates
62. Take a screenshot of long trades only

### Test Direction Filter: Short Only

63. Click on "Short" direction filter button
64. Wait for table to update
65. **Verify** "Short" button is highlighted/active
66. **Verify** only trades with "Short" direction are displayed
67. Take a screenshot of short trades only

### Test Date Range Filter

68. Click on "Both" direction filter to reset
69. Click on Start Date picker
70. Select a date within the backtest period
71. **Verify** date is selected in the input field
72. Take a screenshot with start date selected

73. Click on End Date picker
74. Select a later date within the backtest period
75. **Verify** end date is selected
76. **Verify** trade list updates to show only trades in date range
77. **Verify** active filter count badge shows "2"
78. Take a screenshot of filtered trades by date range

### Test Clear Filters

79. **Verify** "Clear" button is visible when filters are active
80. Click on "Clear" button
81. **Verify** all filters reset to defaults (All, Both, no dates)
82. **Verify** full trade list is displayed again
83. **Verify** active filter count badge disappears
84. Take a screenshot after clearing filters

### Test Combined Filters

85. Click on "Winners" outcome filter
86. Click on "Long" direction filter
87. **Verify** only winning long trades are displayed
88. **Verify** active filter count shows "2"
89. Take a screenshot of combined filter result

90. Click "Clear" to reset filters

### Test Column Sorting: Trade Number

91. Click on "#" column header
92. **Verify** trades are sorted by number ascending (1, 2, 3...)
93. **Verify** up arrow indicator appears in column header
94. Take a screenshot of ascending sort

95. Click on "#" column header again
96. **Verify** trades are sorted by number descending (...3, 2, 1)
97. **Verify** down arrow indicator appears
98. Take a screenshot of descending sort

### Test Column Sorting: Entry Date

99. Click on "Entry Date" column header
100. **Verify** trades are sorted by entry date (earliest to latest)
101. **Verify** sort indicator appears
102. Take a screenshot of date sort

### Test Column Sorting: P/L ($)

103. Click on "P/L ($)" column header
104. **Verify** trades are sorted by profit/loss (lowest to highest)
105. Take a screenshot

106. Click on "P/L ($)" column header again
107. **Verify** trades are sorted descending (highest to lowest)
108. **Verify** most profitable trade appears first
109. Take a screenshot of P/L descending sort

### Test Column Sorting: P/L (%)

110. Click on "P/L (%)" column header
111. **Verify** trades are sorted by percentage return
112. Take a screenshot of percentage sort

### Test Column Sorting: Duration

113. Click on "Duration" column header
114. **Verify** trades are sorted by duration (shortest to longest)
115. Take a screenshot of duration sort

### Test Pagination: Display Info

116. Scroll to bottom of trade list
117. **Verify** pagination info displays "Showing 1-X of Y trades"
118. **Verify** X matches the number of visible rows
119. **Verify** Y matches total filtered trades
120. Take a screenshot of pagination info

### Test Pagination: Page Size Selector

121. **Verify** "Per page" selector is visible
122. **Verify** default page size is 50
123. Click on page size selector
124. **Verify** options include: 25, 50, 100, All
125. Take a screenshot of page size options

126. Select "25" from page size selector
127. Wait for table to update
128. **Verify** only 25 trades are displayed
129. **Verify** pagination info updates to "Showing 1-25 of Y trades"
130. Take a screenshot with 25 trades per page

### Test Pagination: Next/Previous Buttons

131. **Verify** pagination controls are visible at bottom
132. **Verify** Previous button is disabled on page 1
133. **Verify** Next button is enabled (if more than 1 page exists)
134. Take a screenshot of pagination controls

135. Click "Next" button
136. Wait for table to update
137. **Verify** page 2 is displayed
138. **Verify** pagination info shows "Showing 26-50 of Y trades"
139. **Verify** Previous button is now enabled
140. Take a screenshot of page 2

141. Click "Previous" button
142. **Verify** page 1 is displayed again
143. Take a screenshot after navigating back

### Test Pagination: Page Number Buttons

144. **Verify** page number buttons are visible (1, 2, 3, ...)
145. **Verify** current page button is highlighted
146. Click on page number "2"
147. **Verify** page 2 is displayed
148. Take a screenshot of page navigation

### Test Pagination: Jump to Page

149. **Verify** "Go to page" input field is visible
150. Type "1" in the jump to page input
151. Press Enter or blur the input
152. **Verify** page 1 is displayed
153. Take a screenshot of jump to page feature

### Test Pagination: First/Last Page Buttons

154. **Verify** First page button (<<) is visible
155. **Verify** Last page button (>>) is visible
156. Click on Last page button
157. **Verify** navigates to the last page
158. **Verify** Next button is disabled
159. Take a screenshot of last page

160. Click on First page button
161. **Verify** navigates back to page 1
162. Take a screenshot

### Test Trade Row Selection and Highlighting

163. Reset page size to "All" to see all trades
164. Click on the first trade row
165. **Verify** row is highlighted with distinct background color
166. **Verify** row remains highlighted after click
167. Take a screenshot of selected trade row

### Test Chart Highlighting on Trade Click

168. Scroll up to view the equity curve chart
169. **Verify** entry marker appears on the chart (arrow up)
170. **Verify** exit marker appears on the chart (arrow down)
171. **Verify** markers are color-coded (green for profit, red for loss)
172. **Verify** exit marker shows P/L value
173. Take a screenshot of chart with trade markers

### Test Trade Click Toggle

174. Scroll back down to trade list
175. Click on the same trade row again
176. **Verify** row is deselected (highlight removed)
177. Scroll up to chart
178. **Verify** trade markers are removed from chart
179. Take a screenshot showing markers removed

### Test Different Trade Selection

180. Scroll back to trade list
181. Click on a different trade row (e.g., trade #3)
182. **Verify** new row is highlighted
183. Scroll to chart
184. **Verify** new markers appear for the selected trade
185. Take a screenshot of new trade highlighted on chart

### Test Export CSV Functionality

186. Scroll to Trade List header
187. **Verify** "Export CSV" button is visible in the header
188. Click on "Export CSV" button
189. **Verify** CSV file download initiates
190. **Verify** filename format is "{backtest_name}_trades.csv"
191. Take a screenshot of export button

192. Open the downloaded CSV file
193. **Verify** CSV contains all 11 columns:
    - Trade #, Entry Date, Exit Date, Direction, Entry Price, Exit Price, Size, P/L ($), P/L (%), Duration, Exit Reason
194. **Verify** CSV contains all trades (not just current page)
195. **Verify** data matches what's displayed in the table
196. Take a screenshot of CSV file opened

### Test Trade Count Badge Click

197. Scroll up to Backtest Results header
198. **Verify** trade count text is displayed (e.g., "10 trades completed")
199. **Verify** trade count text has hover effect (underline, color change)
200. Click on the trade count text
201. **Verify** Trade List section auto-expands (if collapsed)
202. **Verify** page scrolls to Trade List section
203. Take a screenshot after clicking trade count

### Test Trade List Collapse/Expand

204. Click on Trade List section header
205. **Verify** section collapses (hides table and filters)
206. **Verify** chevron icon changes to down arrow
207. Take a screenshot of collapsed state

208. Click on Trade List section header again
209. **Verify** section expands
210. **Verify** chevron icon changes to up arrow
211. **Verify** all content is visible again
212. Take a screenshot of re-expanded state

### Test Empty State: No Matching Trades

213. Ensure Trade List is expanded
214. Apply filters that result in no trades (e.g., Winners + date range with no winners)
215. **Verify** empty state message appears
216. **Verify** message says "No trades to display" or similar
217. **Verify** sub-message explains "No trades match the current filters"
218. Take a screenshot of empty state

219. Clear filters to restore trade list

### Test Color Coding: P/L Values

220. **Verify** positive P/L values are displayed in green
221. **Verify** negative P/L values are displayed in red
222. **Verify** zero P/L values (if any) are displayed in neutral color
223. **Verify** color coding applies to both $ and % columns
224. Take a screenshot highlighting color coding

### Test Direction Badge Styling

225. **Verify** Long trades show green badge with up arrow icon
226. **Verify** Short trades show red badge with down arrow icon
227. **Verify** badges have rounded corners and padding
228. Take a screenshot of direction badges

### Test Responsive Design: Mobile View (if applicable)

229. Resize browser to mobile width (<768px) or use mobile emulation
230. **Verify** trade table is horizontally scrollable
231. **Verify** less critical columns (Size, Duration) are hidden on mobile
232. **Verify** filter controls stack vertically
233. **Verify** pagination controls are touch-friendly
234. Take a screenshot of mobile view

235. Restore browser to desktop width

### Test Trade List with Large Dataset

236. If a backtest with 100+ trades is available:
    - Open that backtest
    - **Verify** Trade List displays "(Last 100 trades)" warning
    - **Verify** pagination works smoothly
    - **Verify** sorting and filtering performance is acceptable
    - Take a screenshot of large dataset view

### Test Trade List Persistence

237. Navigate away to a different page (e.g., Strategy Builder)
238. Navigate back to the Backtest Configuration page
239. **Verify** Trade List section state is preserved (expanded/collapsed)
240. **Verify** filters are reset to defaults on page reload
241. **Verify** trade data is displayed correctly
242. Take a screenshot confirming persistence

### Final Validation

243. Expand Trade List section
244. **Verify** all 11 columns are visible
245. **Verify** filters work correctly (outcome, direction, date range)
246. **Verify** sorting works for all columns
247. **Verify** pagination works smoothly
248. **Verify** CSV export downloads all trades
249. **Verify** clicking trades highlights them on chart
250. **Verify** color coding is consistent throughout
251. Take a final screenshot of complete Trade List view

## Success Criteria

- Trade List section appears in backtest results with trade count badge
- Trade List is collapsible/expandable with smooth animation
- Trade table displays all 11 columns with proper formatting:
  - Trade #, Entry Date, Exit Date, Direction, Entry Price, Exit Price, Size, P/L ($), P/L (%), Duration, Exit Reason
- All columns are sortable with visible sort indicators (▲/▼)
- Outcome filter works: All | Winners | Losers
- Direction filter works: Both | Long | Short
- Date range filter successfully filters trades by entry date
- Multiple filters can be combined
- Active filter count badge displays correctly
- Clear filters button resets all filters
- Pagination displays correct trade count ("Showing X-Y of Z trades")
- Page size selector works: 25, 50, 100, All
- Previous/Next buttons navigate pages correctly
- Page number buttons navigate to specific pages
- Jump to page input allows direct page navigation
- First/Last page buttons work correctly
- Clicking a trade row highlights it with distinct background
- Clicking a trade adds entry/exit markers to equity curve chart
- Markers are color-coded (green for profit, red for loss)
- Clicking same trade again deselects and removes markers
- Export CSV button downloads CSV file with all trades
- CSV contains all 11 columns with proper headers
- CSV includes all trades (not just visible page)
- Clicking trade count in header expands and scrolls to Trade List
- Empty state displays when no trades match filters
- P/L values are color-coded (green/red/neutral)
- Direction badges show appropriate icons and colors
- Responsive design works on mobile (<768px)
- Large datasets (100+ trades) handle smoothly with warning message
- Trade List state persists on page navigation
- 25+ screenshots are taken documenting the complete flow
