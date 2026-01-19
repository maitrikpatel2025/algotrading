# E2E Test: Drag Pattern onto Chart

Test the drag-and-drop pattern recognition functionality in the Forex Trading Dashboard Strategy page.

## User Story

As a forex trader
I want to drag candlestick patterns (Doji, Hammer, Engulfing, etc.) onto the chart
So that I can see historical occurrences and include pattern recognition in my strategy

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

### Test Patterns Category in Library

11. Locate the "Patterns" category in the indicator library panel
12. **Verify** the Patterns category is visible and expandable
13. Click to expand the Patterns category (if collapsed)
14. Take a screenshot showing the Patterns category expanded
15. **Verify** at least 8 patterns are listed: Doji, Hammer, Inverted Hammer, Bullish Engulfing, Bearish Engulfing, Morning Star, Evening Star, Three White Soldiers, Three Black Crows

### Test Drag Preview and Drop Zone Highlight

16. Locate the "Hammer" pattern in the Patterns category
17. Start dragging the Hammer pattern (mousedown and start drag)
18. **Verify** the drag preview follows the cursor showing "Hammer"
19. Move the dragged pattern over the chart area
20. Take a screenshot showing the drop zone highlight
21. **Verify** the chart area shows a highlighted border (ring-2 ring-primary)

### Test Pattern Detection (Hammer - Bullish)

22. Drop the Hammer pattern onto the chart
23. Wait for pattern detection and rendering
24. Take a screenshot showing Hammer pattern markers on the chart
25. **Verify** green triangle markers appear above candles where Hammer patterns are detected
26. **Verify** a "Hammer" badge appears in the active patterns section with pattern count (e.g., "Found X Hammer patterns")

### Test Pattern Tooltip

27. Hover over one of the Hammer pattern markers on the chart
28. Take a screenshot showing the pattern tooltip
29. **Verify** tooltip displays: pattern name ("Hammer"), date/time, and reliability score

### Test Condition Block Auto-Creation

30. Look at the Logic Panel on the right side
31. Take a screenshot showing the Logic Panel with pattern condition
32. **Verify** a condition block was auto-created with "Hammer is detected"

### Test Bearish Pattern (Bearish Engulfing)

33. Drag and drop the "Bearish Engulfing" pattern onto the chart
34. Take a screenshot showing both Hammer and Bearish Engulfing patterns
35. **Verify** red triangle markers appear for Bearish Engulfing patterns
36. **Verify** both "Hammer" and "Bearish Engulfing" badges appear with counts

### Test Neutral Pattern (Doji)

37. Drag and drop the "Doji" pattern onto the chart
38. Take a screenshot showing Doji markers (gray)
39. **Verify** gray markers appear for Doji patterns
40. **Verify** three pattern badges are shown

### Test Undo Functionality

41. Press Ctrl+Z (or Cmd+Z on Mac)
42. **Verify** the last added pattern (Doji) is removed
43. Take a screenshot after undo
44. **Verify** only two pattern badges remain (Hammer and Bearish Engulfing)

### Test Manual Pattern Removal

45. Click the X button on the "Bearish Engulfing" pattern badge
46. **Verify** the Bearish Engulfing pattern is removed from the chart
47. **Verify** the corresponding badge is removed
48. Take a screenshot after manual removal
49. **Verify** only "Hammer" pattern badge remains

### Test Multi-Candle Pattern (Morning Star)

50. Drag and drop the "Morning Star" pattern onto the chart
51. Take a screenshot showing Morning Star detection
52. **Verify** Morning Star (3-candle bullish reversal) markers appear if detected
53. **Verify** pattern count displays correctly

### Test Pattern-Condition Linking

54. In the Logic Panel, hover over the Hammer condition block
55. **Verify** the corresponding pattern markers on the chart are highlighted
56. Take a screenshot showing the hover highlight connection

## Success Criteria

- Patterns category visible in indicator library with 8+ candlestick patterns
- Patterns are draggable with visual drag preview showing pattern name
- Chart area highlights when pattern is dragged over it (dashed border highlight)
- Bullish patterns (Hammer, Morning Star, etc.) show green markers above candles
- Bearish patterns (Bearish Engulfing, Evening Star, etc.) show red markers above candles
- Neutral patterns (Doji) show gray markers
- Pattern tooltip on hover shows: pattern name, date/time, reliability score
- Pattern count badge displays (e.g., "Found X Hammer patterns")
- Condition block auto-created: "When [Pattern] is detected"
- Ctrl+Z removes the last added pattern
- Active patterns displayed as removable badges in chart header
- X button on badges removes the pattern and its markers
- 15+ screenshots are taken documenting the full test flow
