# E2E Test: View Trades on Chart

Test the View Trades on Chart functionality in Backtest Results including trade marker display, filtering, toggling visibility, and navigation to trade list.

## User Story

As a trader analyzing backtest results
I want to see backtest trades plotted on the price chart
So that I can visually validate trade entries and exits in the context of market price movements

## Prerequisites

- At least one strategy exists with entry conditions defined
- At least one completed backtest with 10+ trades (mix of winners and losers, long and short) exists
- Price data is available for the backtest's date range

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
11. Take a screenshot showing backtest results summary with equity curve

### Test "View on Price Chart" Button Display

12. Scroll to the Equity Curve section
13. **Verify** "View on Price Chart" button is visible next to the "Equity Curve" header
14. **Verify** button displays LineChart icon and "View on Price Chart" text
15. Take a screenshot of the equity curve section with the button

### Test Price Chart View Display

16. Click on "View on Price Chart" button
17. Wait for price data to load
18. **Verify** loading spinner is displayed during data fetch
19. Take a screenshot of loading state

20. Wait for price chart to render
21. **Verify** "Price Chart with Trades" section appears below equity curve
22. **Verify** section header shows:
    - LineChart icon
    - "Price Chart with Trades" title
    - Pair and granularity (e.g., "EUR_USD · H1")
    - "Hide" button
23. Take a screenshot of price chart section header

### Test Trade Chart Overlay Controls

24. **Verify** Trade Chart Overlay controls are visible above the chart
25. **Verify** controls show:
    - Eye icon button with "Trades" label (should be active/highlighted)
    - Filter buttons: "All", "Winners", "Losers"
    - Trade count badge (e.g., "12 of 12 trades")
26. **Verify** "All" filter is selected by default
27. Take a screenshot of trade chart overlay controls

### Test Price Chart with Trade Markers

28. **Verify** price chart displays candlesticks for the backtest period
29. **Verify** trade entry markers are visible on the chart
30. **Verify** entry markers for long trades show green arrow pointing up below the candle
31. **Verify** entry markers for short trades show red arrow pointing down above the candle
32. **Verify** entry markers display trade number (e.g., "#1", "#2")
33. Take a screenshot of price chart with entry markers

34. **Verify** trade exit markers are visible on the chart
35. **Verify** exit markers for winning trades show green circle with P/L text (e.g., "+$12.50")
36. **Verify** exit markers for losing trades show red circle with P/L text (e.g., "-$5.25")
37. **Verify** exit markers appear at the correct exit time
38. Take a screenshot of price chart showing both entry and exit markers

### Test Trade Marker Colors

39. Identify a long winning trade on the chart
40. **Verify** entry marker is green arrow up
41. **Verify** exit marker is green circle with positive P/L
42. Take a screenshot of long winning trade

43. Identify a long losing trade on the chart
44. **Verify** entry marker is green arrow up
45. **Verify** exit marker is red circle with negative P/L
46. Take a screenshot of long losing trade

47. Identify a short winning trade on the chart
48. **Verify** entry marker is red arrow down
49. **Verify** exit marker is green circle with positive P/L
50. Take a screenshot of short winning trade

51. Identify a short losing trade on the chart
52. **Verify** entry marker is red arrow down
53. **Verify** exit marker is red circle with negative P/L
54. Take a screenshot of short losing trade

### Test Toggle Trade Visibility

55. Click on the Eye icon button to toggle trade visibility off
56. **Verify** button changes to EyeOff icon with muted styling
57. **Verify** all trade markers disappear from the chart
58. **Verify** filter buttons and trade count badge are hidden
59. Take a screenshot of chart with trades hidden

60. Click on the EyeOff icon button to toggle trade visibility back on
61. **Verify** button changes back to Eye icon with active styling
62. **Verify** trade markers reappear on the chart
63. **Verify** filter buttons and trade count badge reappear
64. Take a screenshot of chart with trades visible again

### Test Filter: Winners Only

65. Click on "Winners" filter button
66. Wait for chart to update
67. **Verify** "Winners" button is highlighted/active
68. **Verify** only winning trades are displayed on the chart
69. **Verify** all visible exit markers show green circles with positive P/L
70. **Verify** trade count badge updates (e.g., "8 of 12 trades" if 8 winners out of 12 total)
71. Take a screenshot of chart showing winners only

### Test Filter: Losers Only

72. Click on "Losers" filter button
73. Wait for chart to update
74. **Verify** "Losers" button is highlighted/active
75. **Verify** only losing trades are displayed on the chart
76. **Verify** all visible exit markers show red circles with negative P/L
77. **Verify** trade count badge updates (e.g., "4 of 12 trades" if 4 losers out of 12 total)
78. Take a screenshot of chart showing losers only

### Test Filter: All Trades

79. Click on "All" filter button
80. Wait for chart to update
81. **Verify** "All" button is highlighted/active
82. **Verify** all trades (winners and losers) are displayed on the chart
83. **Verify** trade count badge shows total (e.g., "12 of 12 trades")
84. Take a screenshot of chart showing all trades

### Test Trade Marker Click - Navigate to Trade List

85. Scroll down to ensure trade list section is visible (may need to expand it first)
86. Take a screenshot of trade list section

87. Scroll back up to the price chart
88. Click on a trade entry marker (e.g., trade #3)
89. Wait for scroll animation
90. **Verify** page scrolls to the trade list section
91. **Verify** trade list is expanded if it was collapsed
92. **Verify** the corresponding trade row (trade #3) is highlighted
93. **Verify** the trade row briefly flashes/pulses for visibility
94. Take a screenshot of highlighted trade row in trade list

95. Scroll back to the price chart
96. Click on a different trade marker (e.g., trade #7 exit marker)
97. Wait for scroll animation
98. **Verify** page scrolls to trade list
99. **Verify** trade #7 row is highlighted and animated
100. Take a screenshot of new highlighted trade row

### Test Chart Zoom and Pan with Trades

101. Scroll back to price chart
102. Use mouse wheel or pinch gesture to zoom into a section with trades
103. **Verify** chart zooms in smoothly
104. **Verify** trade markers remain visible and correctly positioned
105. Take a screenshot of zoomed-in chart with trade markers

106. Click and drag on the chart to pan left or right
107. **Verify** chart pans smoothly
108. **Verify** trade markers move with the chart
109. Take a screenshot of panned chart view

### Test Hide Price Chart View

110. Scroll to the price chart section header
111. Click on "Hide" button
112. **Verify** price chart section collapses/hides
113. **Verify** "View on Price Chart" button is still visible in equity curve section
114. Take a screenshot after hiding price chart

### Test Re-open Price Chart View

115. Click on "View on Price Chart" button again
116. **Verify** price chart section reappears
117. **Verify** chart loads without needing to re-fetch data (uses cached data)
118. **Verify** previous filter settings are preserved (e.g., if "Winners" was selected before hiding)
119. Take a screenshot of re-opened price chart

### Test Empty State - No Trades

120. **Note:** This step may require running a backtest with 0 trades, or may be skipped if not feasible
121. If a backtest with 0 trades exists, navigate to it
122. Click "View on Price Chart"
123. **Verify** chart loads but no trade markers are displayed
124. **Verify** trade count badge shows "0 trades"
125. Take a screenshot of chart with no trades

### Test Error State - Price Data Fetch Failure

126. **Note:** This may require manually triggering an API error or network failure
127. **Manual testing recommended:** Temporarily disable network or API endpoint
128. Click "View on Price Chart" on a backtest
129. **Verify** error message is displayed: "Failed to load price data"
130. **Verify** "Retry" button is visible
131. Take a screenshot of error state

132. **Manual testing:** Re-enable network/API
133. Click "Retry" button
134. **Verify** price data loads successfully
135. Take a screenshot of successful retry

### Test Performance - Many Trades

136. **Note:** This requires a backtest with 100+ trades
137. If available, navigate to a backtest with 100+ trades
138. Click "View on Price Chart"
139. Wait for chart to render
140. **Verify** chart renders smoothly without lag
141. **Verify** all trade markers are visible
142. Take a screenshot of chart with many trades

143. Test zoom and pan performance
144. **Verify** interactions remain smooth with many markers
145. Take a screenshot after zoom/pan

### Test LocalStorage Persistence

146. Set trade visibility to hidden (EyeOff)
147. Set filter to "Winners"
148. Refresh the page
149. Click "View on Price Chart" again
150. **Verify** trade visibility setting is restored (hidden)
151. **Verify** filter setting is restored ("Winners")
152. Take a screenshot verifying persisted settings

### Final Verification

153. **Verify** all screenshots were captured successfully (minimum 30 screenshots expected)
154. Review screenshots for visual correctness
155. **Verify** no console errors related to trade markers or price chart
156. Take a final screenshot of the complete feature in action

## Expected Results

- "View on Price Chart" button appears in backtest results when trades exist
- Price chart loads with candlestick data for the backtest period
- Trade markers display correctly:
  - Entry markers: green arrow up (long), red arrow down (short)
  - Exit markers: green circle (winners), red circle (losers) with P/L text
  - Trade numbers shown on entry markers
- Trade chart overlay controls work:
  - Toggle visibility shows/hides all trades
  - Filters update visible trades (All, Winners, Losers)
  - Trade count badge shows accurate counts
- Clicking trade markers navigates to and highlights corresponding row in trade list
- Chart zoom and pan work smoothly with trade markers
- Settings persist to localStorage (visibility, filter)
- Loading and error states display correctly
- Performance is acceptable with 100+ trades

## Success Criteria

- All verification steps pass
- All screenshots captured and show expected UI state
- Trade markers are accurately positioned at entry/exit times
- Colors match design specifications (green for bullish/wins, red for bearish/losses)
- Click navigation between chart and trade list works reliably
- Filter and toggle controls update chart markers correctly
- No console errors or visual glitches
- Feature provides clear visual validation of trade performance

## Notes

- Trade marker tooltips may be deferred to a future enhancement
- Connecting lines between entry/exit may be deferred to a future enhancement
- Focus on core functionality: displaying trades, filtering, navigation
- Ensure trade markers align with actual candle times
- Test with a variety of trade outcomes (winners, losers, long, short) for comprehensive coverage
