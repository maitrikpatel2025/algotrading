# E2E Test: Drag Indicator onto Chart

Test the drag-and-drop indicator functionality in the Forex Trading Dashboard Strategy page.

## User Story

As a forex trader
I want to drag an indicator from the library and drop it directly onto the chart
So that I can instantly see how the indicator looks on my price data

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

### Test Drag Preview and Drop Zone Highlight

11. Locate the "SMA" indicator in the Trend category
12. Start dragging the SMA indicator (mousedown and start drag)
13. **Verify** the drag preview follows the cursor showing "SMA"
14. Move the dragged indicator over the chart area
15. Take a screenshot showing the drop zone highlight
16. **Verify** the chart area shows a highlighted border (ring-2 ring-primary)

### Test Overlay Indicator (SMA)

17. Drop the SMA indicator onto the chart
18. Wait for indicator calculation and rendering
19. Take a screenshot showing SMA rendered on the chart
20. **Verify** an SMA line is visible on the main price chart
21. **Verify** an "SMA" badge appears in the active indicators section

### Test Another Overlay Indicator (EMA)

22. Drag and drop the "EMA" indicator onto the chart
23. Take a screenshot showing both SMA and EMA on the chart
24. **Verify** both SMA and EMA lines are visible on the price chart
25. **Verify** both "SMA" and "EMA" badges appear in the active indicators

### Test Subchart Indicator (RSI)

26. Locate the "RSI" indicator in the Momentum category
27. Drag and drop the RSI indicator onto the chart
28. Wait for indicator calculation
29. Take a screenshot showing RSI in a separate pane
30. **Verify** the RSI indicator is rendered in a separate sub-chart below the main chart
31. **Verify** an "RSI" badge appears in the active indicators

### Test Indicator Limit Enforcement

32. Add more overlay indicators by dragging: Bollinger Bands, Keltner Channel
33. Take a screenshot after adding 4 overlay indicators
34. **Verify** 4 overlay indicator badges are shown (SMA, EMA, Bollinger Bands, Keltner Channel)
35. Drag another overlay indicator (e.g., SMA again) onto the chart
36. **Verify** an error message appears: "Maximum indicators reached. Remove one to add another."
37. Take a screenshot showing the error message

### Test Undo Functionality

38. Press Ctrl+Z (or Cmd+Z on Mac)
39. **Verify** the last added indicator is removed
40. Take a screenshot after undo
41. **Verify** one less badge is shown in the active indicators section

### Test Manual Indicator Removal

42. Click the X button on one of the indicator badges
43. **Verify** the indicator is removed from the chart
44. **Verify** the corresponding badge is removed
45. Take a screenshot after manual removal

### Test Subchart Indicator Limit

46. Add RSI, MACD, and Stochastic (3 subchart indicators)
47. **Verify** 3 subchart indicators are rendered
48. Try to add another subchart indicator (e.g., CCI)
49. **Verify** the error message appears for subchart limit
50. Take a screenshot showing subchart limit error

## Success Criteria

- Indicators are draggable with visual drag preview showing indicator short name
- Chart area highlights when indicator is dragged over it (dashed border highlight)
- Overlay indicators (SMA, EMA, Bollinger Bands) render directly on the main price chart
- Subchart indicators (RSI, MACD) create new sub-chart panes below the main chart
- Maximum 5 overlay indicators enforced with error message
- Maximum 3 subchart indicators enforced with error message
- Error message displays: "Maximum indicators reached. Remove one to add another."
- Ctrl+Z removes the last added indicator
- Active indicators displayed as removable badges in chart header
- X button on badges removes the indicator
- 12 screenshots are taken documenting the full test flow
