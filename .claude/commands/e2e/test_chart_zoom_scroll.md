# E2E Test: Chart Zoom and Scroll Controls

Test the comprehensive zoom and scroll interactions for the interactive candlestick chart in the Forex Trading Dashboard Strategy page.

## User Story

As a forex trader analyzing price patterns
I want to zoom in and out of candlestick charts and pan across historical data
So that I can examine price action at different detail levels and identify trading opportunities across various timeframes

## Test Steps

### Initial Setup and Navigation

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Click on "Strategy" in the navigation
3. Take a screenshot of the Strategy page
4. Select "EUR/USD" from the currency pair dropdown
5. Select "H1" from the timeframe dropdown
6. Select "200" from the candle count selector
7. Click "Load Data" button
8. Wait for the chart to load
9. Take a screenshot of the initial chart state
10. **Verify** the chart renders successfully with approximately 200 candlesticks

### Interaction Hints Tooltip Tests

11. **Verify** interaction hints tooltip appears on first load (if not previously dismissed)
12. Take a screenshot of the interaction hints tooltip
13. **Verify** the tooltip displays appropriate text based on device type:
    - Desktop: "Scroll to zoom • Drag to pan • Double-click to reset" with keyboard shortcuts
    - Touch: "Pinch to zoom • Drag to pan • Double-tap to reset"
14. **Verify** the tooltip has a dark semi-transparent background (bg-black/90)
15. **Verify** the tooltip includes a dismiss button (X icon)
16. Click the dismiss button on the interaction hints tooltip
17. **Verify** the tooltip disappears
18. **Verify** localStorage contains 'chart-interaction-hint-dismissed' = 'true'
19. Refresh the page and load chart data again
20. **Verify** the interaction hints tooltip does NOT appear after refresh (has been dismissed)

### Zoom Level Indicator Tests

21. **Verify** the zoom level indicator is visible below the chart
22. **Verify** it displays "Showing 200 candles" (or the actual candle count)
23. Take a screenshot of the zoom level indicator
24. **Verify** the indicator uses text-sm, text-muted-foreground, and font-medium classes
25. **Verify** the indicator is centered below the chart with mt-2 spacing

### Mouse Wheel Zoom In Tests

26. Position mouse cursor in the center of the chart
27. Scroll mouse wheel up (or use touchpad pinch-in gesture) to zoom in
28. **Verify** the chart zooms in smoothly toward the cursor position
29. Take a screenshot after zooming in once
30. **Verify** the zoom level indicator updates to show fewer candles (e.g., "Showing 160 candles")
31. Scroll mouse wheel up multiple times to zoom in further
32. **Verify** each zoom operation reduces the visible candle count by approximately 20%
33. Take a screenshot when approaching minimum zoom constraint
34. Continue zooming in until constraint is reached
35. **Verify** the chart stops zooming when 50 candles are visible
36. **Verify** the zoom level indicator displays "Showing 50 candles"
37. Attempt to zoom in further
38. **Verify** the chart prevents zooming beyond 50 candles (minimum constraint enforced)
39. Take a screenshot at minimum zoom (50 candles)

### Mouse Wheel Zoom Out Tests

40. Scroll mouse wheel down (or use touchpad pinch-out gesture) to zoom out
41. **Verify** the chart zooms out smoothly from the cursor position
42. Take a screenshot after zooming out once
43. **Verify** the zoom level indicator updates to show more candles
44. Continue zooming out progressively
45. **Verify** each zoom operation increases the visible candle count by approximately 20%
46. Take a screenshot when approaching maximum zoom constraint
47. Continue zooming out until constraint is reached
48. **Verify** the chart stops zooming when 500 candles are visible (or dataset max if < 500)
49. **Verify** the zoom level indicator displays "Showing 500 candles" (or dataset max)
50. Attempt to zoom out further
51. **Verify** the chart prevents zooming beyond 500 candles (maximum constraint enforced)
52. Take a screenshot at maximum zoom (500 candles)

### Cursor-Centered Zoom Tests

53. Double-click the chart to reset zoom to full data view
54. **Verify** the chart resets to show all available candles
55. Position mouse cursor over a specific candle on the left side of the chart
56. Scroll mouse wheel up to zoom in
57. **Verify** the chart zooms toward the candle under the cursor
58. **Verify** the candle under the cursor remains approximately under the cursor after zoom
59. Take a screenshot of left-side cursor zoom
60. Double-click to reset zoom
61. Position mouse cursor over a specific candle on the right side of the chart
62. Scroll mouse wheel up to zoom in
63. **Verify** the chart zooms toward the candle under the cursor (right side)
64. Take a screenshot of right-side cursor zoom
65. **Verify** zoom behavior feels intuitive and follows cursor position

### Click-Drag Panning Tests

66. Double-click to reset zoom to full view
67. Zoom in to approximately 100 candles visible
68. Click and hold on the chart, then drag left
69. **Verify** the chart pans to the right (showing earlier data)
70. Take a screenshot after panning left
71. **Verify** the zoom level indicator still shows approximately 100 candles (count doesn't change during pan)
72. Click and hold on the chart, then drag right
73. **Verify** the chart pans to the left (showing later data)
74. Take a screenshot after panning right
75. **Verify** panning is smooth and responsive

### Boundary Constraint Tests

76. Pan the chart left until reaching the first candle in the dataset
77. Attempt to continue panning left beyond the first candle
78. **Verify** the chart stops panning and does not go beyond the first candle
79. Take a screenshot at the left boundary
80. Pan the chart right until reaching the last candle in the dataset
81. Attempt to continue panning right beyond the last candle
82. **Verify** the chart stops panning and does not go beyond the last candle
83. Take a screenshot at the right boundary
84. **Verify** boundary constraints prevent scrolling beyond available data range

### Double-Click Reset Tests

85. Zoom in to minimum constraint (50 candles)
86. Pan to an arbitrary position in the middle of the dataset
87. Double-click anywhere on the chart
88. **Verify** the chart resets to full autorange view
89. **Verify** all available data is visible
90. Take a screenshot after double-click reset
91. **Verify** the zoom level indicator updates to show total candle count (e.g., "Showing 200 candles")

### Keyboard Shortcut: Zoom In (+/=) Tests

92. Ensure no input field is focused (click on the page background)
93. Press the "+" key on the keyboard
94. **Verify** the chart zooms in by approximately 20%
95. Take a screenshot after keyboard zoom in
96. **Verify** the zoom level indicator updates to show fewer candles
97. Press the "=" key (alternative zoom in key)
98. **Verify** the chart zooms in again
99. Press "+" multiple times rapidly
100. **Verify** the chart zooms in smoothly with each keypress
101. **Verify** animations are smooth using requestAnimationFrame (no stuttering)
102. Continue pressing "+" until reaching the 50-candle minimum constraint
103. **Verify** zoom stops at 50 candles
104. Take a screenshot at minimum zoom via keyboard

### Keyboard Shortcut: Zoom Out (-) Tests

105. Press the "-" key on the keyboard
106. **Verify** the chart zooms out by approximately 20%
107. Take a screenshot after keyboard zoom out
108. **Verify** the zoom level indicator updates to show more candles
109. Press "-" multiple times rapidly
110. **Verify** the chart zooms out smoothly with each keypress
111. Continue pressing "-" until reaching the 500-candle maximum constraint
112. **Verify** zoom stops at 500 candles (or dataset max if < 500)
113. Take a screenshot at maximum zoom via keyboard

### Keyboard Shortcut: Scroll Left (←) Tests

114. Double-click to reset zoom
115. Zoom in to approximately 100 candles visible
116. Press the "←" (ArrowLeft) key on the keyboard
117. **Verify** the chart scrolls left by approximately 10% of the visible range
118. Take a screenshot after scrolling left
119. **Verify** the zoom level indicator still shows approximately 100 candles
120. Press "←" multiple times rapidly
121. **Verify** the chart scrolls left smoothly with each keypress
122. Continue pressing "←" until reaching the first candle
123. **Verify** scrolling stops at the left boundary (first candle)
124. Take a screenshot at left boundary via keyboard

### Keyboard Shortcut: Scroll Right (→) Tests

125. Press the "→" (ArrowRight) key on the keyboard
126. **Verify** the chart scrolls right by approximately 10% of the visible range
127. Take a screenshot after scrolling right
128. Press "→" multiple times rapidly
129. **Verify** the chart scrolls right smoothly with each keypress
130. Continue pressing "→" until reaching the last candle
131. **Verify** scrolling stops at the right boundary (last candle)
132. Take a screenshot at right boundary via keyboard

### Focus Management Tests

133. Double-click to reset zoom to full view
134. Click on the "Chart Type" Select dropdown to open it
135. Press the "+" key on the keyboard
136. **Verify** the chart does NOT zoom in (dropdown receives the key)
137. **Verify** the Select dropdown remains open and handles the key appropriately
138. Press Escape to close the dropdown
139. Press the "+" key again
140. **Verify** the chart now zooms in (no input field is focused)
141. Click on the "Candles" Select dropdown to open it
142. Press the "ArrowRight" key
143. **Verify** the chart does NOT scroll right (dropdown navigation receives the key)
144. Press Escape to close the dropdown
145. Press the "ArrowRight" key again
146. **Verify** the chart now scrolls right
147. Take a screenshot after verifying focus management

### Combined Interaction Tests

148. Double-click to reset zoom to full view
149. Use mouse wheel to zoom in to approximately 150 candles
150. Use "ArrowLeft" key to scroll left
151. Use "+" key to zoom in further to approximately 120 candles
152. Use click-drag to pan right
153. Use "-" key to zoom out to approximately 150 candles
154. Use "ArrowRight" key to scroll right
155. Take a screenshot of final position after combined interactions
156. **Verify** all interaction modes work together seamlessly
157. **Verify** the zoom level indicator accurately reflects the final candle count

### Performance Tests with Large Dataset

158. Select "All" from the date range buttons to load maximum candles (up to 1000)
159. Wait for chart to render
160. Take a screenshot with large dataset
161. **Verify** the chart renders within reasonable time (< 3 seconds)
162. Use mouse wheel to zoom in and out rapidly
163. **Verify** zoom operations maintain 60fps performance (no lag or stuttering)
164. Use keyboard shortcuts to zoom and scroll rapidly
165. **Verify** keyboard operations are smooth and responsive
166. Use click-drag to pan across the large dataset
167. **Verify** panning is smooth even with 1000 candles
168. Take a screenshot after performance testing
169. **Verify** the zoom level indicator updates correctly even with large dataset

### Smooth Transitions and Animations Tests

170. Double-click to reset zoom
171. Zoom in using "+" key
172. **Verify** the zoom transition uses 150ms duration with cubic-in-out easing
173. **Verify** the animation is smooth and visually pleasing (no jumps or stutters)
174. Scroll using "ArrowLeft" key
175. **Verify** the scroll transition is smooth and uses requestAnimationFrame
176. Rapidly press "-" key 5 times in quick succession
177. **Verify** animations queue properly and complete smoothly without conflicts
178. Take a screenshot mid-animation (if possible)

### Chart Type and Volume Toggle Interaction Tests

179. With zoom applied (not at full view), select "OHLC" from chart type selector
180. **Verify** the chart type changes to OHLC while maintaining zoom level
181. **Verify** the zoom level indicator remains accurate
182. Take a screenshot of OHLC chart with zoom
183. Toggle volume on
184. **Verify** volume bars appear while maintaining zoom level
185. **Verify** zoom and pan interactions still work correctly with volume enabled
186. Take a screenshot with volume and zoom
187. Select "Line" chart type
188. **Verify** line chart renders with current zoom level maintained
189. **Verify** all zoom/scroll interactions work with line chart type

### Touch Device Simulation Tests

190. Open browser DevTools and enable device emulation (iPad or similar)
191. Reload the page and load chart data
192. Take a screenshot in mobile/tablet viewport
193. **Verify** touch-specific interaction hints are displayed: "Pinch to zoom • Drag to pan • Double-tap to reset"
194. Simulate pinch gesture to zoom in (using DevTools touch emulation)
195. **Verify** the chart zooms in
196. Simulate pinch gesture to zoom out
197. **Verify** the chart zooms out
198. **Verify** zoom constraints (50-500 candles) are enforced on touch devices
199. Simulate drag gesture to pan
200. **Verify** panning works on touch devices
201. **Verify** boundary constraints are enforced on touch devices
202. Take a screenshot of touch device zoom state

### Edge Case: Small Dataset Tests

203. Restore desktop viewport
204. Select "1D" date range (small dataset with potentially < 50 candles)
205. Click "Load Data"
206. Take a screenshot of small dataset
207. **Verify** if dataset has fewer than 50 candles, all candles are shown
208. **Verify** minimum constraint (50 candles) is NOT enforced for datasets < 50 candles
209. Attempt to zoom in
210. **Verify** zoom behavior handles small dataset gracefully
211. Take a screenshot after zoom attempt on small dataset

### Error Recovery Tests

212. Load a normal dataset (200 candles)
213. Apply zoom (100 candles visible)
214. Change the currency pair to "GBP/USD"
215. Click "Load Data"
216. Take a screenshot after loading new pair
217. **Verify** the chart resets to full view with new data
218. **Verify** the zoom level indicator updates to show new candle count
219. **Verify** all zoom and scroll interactions work with new dataset
220. **Verify** interaction hints tooltip does not reappear (already dismissed)

### Final State Verification

221. Reset to "EUR/USD", "H1", "200" candles
222. Clear localStorage to reset interaction hints
223. Reload page and load chart data
224. **Verify** interaction hints tooltip appears again (localStorage cleared)
225. Dismiss the tooltip
226. Use mouse wheel to zoom to approximately 120 candles
227. Use keyboard to scroll left
228. Take final comprehensive screenshot showing:
    - Chart with zoom applied
    - Zoom level indicator showing candle count
    - No interaction hints (dismissed)
    - All chart controls visible and functional
229. **Verify** all zoom and scroll features work correctly in final state

## Success Criteria

- ✅ Interaction hints tooltip appears on first chart load
- ✅ Tooltip displays appropriate text for desktop (mouse + keyboard) vs touch devices
- ✅ Tooltip can be dismissed and persists dismissal in localStorage
- ✅ Zoom level indicator displays "Showing X candles" below chart
- ✅ Zoom level indicator updates in real-time during all zoom/pan operations
- ✅ Mouse wheel zoom in/out works smoothly with cursor-centered zooming
- ✅ Zoom constraints enforce minimum 50 candles visible
- ✅ Zoom constraints enforce maximum 500 candles visible
- ✅ Zoom constraints are NOT enforced for datasets smaller than 50 candles
- ✅ Click-drag panning allows horizontal scrolling through price data
- ✅ Boundary constraints prevent scrolling beyond first/last candle
- ✅ Double-click reset restores chart to autorange (full data view)
- ✅ Keyboard shortcut "+" or "=" zooms in by 20%
- ✅ Keyboard shortcut "-" zooms out by 20%
- ✅ Keyboard shortcut "←" (ArrowLeft) scrolls left by 10% of visible range
- ✅ Keyboard shortcut "→" (ArrowRight) scrolls right by 10% of visible range
- ✅ Focus management prevents keyboard shortcuts when typing in Select dropdowns
- ✅ Keyboard shortcuts do not interfere with input fields or textareas
- ✅ All zoom/scroll operations use smooth transitions (150ms with cubic-in-out easing)
- ✅ requestAnimationFrame is used for keyboard operations (smooth 60fps performance)
- ✅ Chart maintains 60fps performance with up to 1000 candles during zoom/scroll
- ✅ Zoom level is maintained when changing chart types or toggling volume
- ✅ Touch device detection works correctly and shows appropriate interaction hints
- ✅ Pinch-to-zoom and touch pan gestures work on mobile/tablet devices
- ✅ All UI elements follow style guide (text-sm, text-muted-foreground, bg-black/90, etc.)
- ✅ No regressions in existing chart functionality (chart types, volume, date ranges)
- ✅ Zoom state resets when loading new data (different pair or timeframe)
- ✅ All features work across different chart types (candlestick, OHLC, line, area)
- ✅ At least 30 screenshots captured documenting the full test flow
