# E2E Test: Strategy Candle Count Change

Test that changing candle counts on the Strategy page works without errors and properly updates the chart.

## User Story

As a trader
I want to change the number of visible candles on the price chart
So that I can analyze different time horizons without encountering errors

## Test Steps

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Take a screenshot of the initial state
3. **Verify** the page loads successfully

4. Click on "Strategy" in the navigation
5. Take a screenshot of the Strategy page
6. **Verify** the Strategy page loads
7. **Verify** the following elements are present:
   - Pair selector dropdown
   - Timeframe selector dropdown
   - Load Data button
   - Chart type selector (Candlestick, OHLC, Line, Area)
   - Candle count selector

8. Select "EUR/USD" from the pair dropdown
9. Select "H1" from the timeframe dropdown
10. Click "Load Data" button
11. Wait for the chart to render
12. Take a screenshot of the initial chart
13. **Verify** the chart displays with candlestick data
14. **Verify** the candle count selector shows "50" (default)
15. **Verify** no console errors are present

16. Ensure "Candlestick" is selected as the chart type
17. Click the candle count dropdown
18. Select "100" from the dropdown
19. Wait for the chart to update
20. Take a screenshot of the chart with 100 candles
21. **Verify** the chart updates without errors
22. **Verify** no "Invalid time value" error appears in console
23. **Verify** the candle count selector shows "100"
24. **Verify** the chart displays approximately 100 candles

25. Click the candle count dropdown again
26. Select "200" from the dropdown
27. Wait for the chart to update
28. Take a screenshot of the chart with 200 candles
29. **Verify** the chart updates without errors
30. **Verify** no "Invalid time value" error appears in console
31. **Verify** the candle count selector shows "200"
32. **Verify** the chart displays approximately 200 candles

33. Click the candle count dropdown again
34. Select "50" from the dropdown (back to original)
35. Wait for the chart to update
36. Take a screenshot of the chart back to 50 candles
37. **Verify** the chart updates without errors
38. **Verify** no "Invalid time value" error appears in console
39. **Verify** the candle count selector shows "50"
40. **Verify** the chart displays approximately 50 candles

## Success Criteria
- Strategy page loads successfully
- Chart renders with EUR/USD H1 data
- Changing candle count from 50 to 100 works without errors
- Changing candle count from 100 to 200 works without errors
- Changing candle count from 200 to 50 works without errors
- No "Invalid time value" runtime errors occur
- No "RangeError: Invalid time value" appears in console
- Chart updates smoothly with each candle count change
- 6 screenshots are taken showing the progression
- All chart data renders correctly at each candle count

## Error Conditions to Check
- **Must NOT see**: "Uncaught runtime errors" overlay
- **Must NOT see**: "RangeError: Invalid time value" in console
- **Must NOT see**: "ERROR Invalid time value" message
- **Must NOT see**: Application crash or unresponsive state
- Chart should re-render smoothly without freezing

## Notes
This test specifically validates the fix for issue #39 where changing candle counts triggered a "Invalid time value" error in the `clampZoomRange` function. The test ensures the validation logic properly handles all date calculations and prevents NaN propagation.
