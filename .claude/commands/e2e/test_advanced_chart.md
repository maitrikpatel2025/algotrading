# E2E Test: Advanced Chart

Test the advanced trading chart functionality in the Forex Trading Dashboard application.

## User Story

As a forex trader
I want an advanced trading chart with multiple chart types, volume indicators, and quick date range selection
So that I can analyze price movements more effectively and make better-informed trading decisions

## Test Steps

1. Navigate to the `Application URL`
2. Take a screenshot of the initial state (Home page)
3. **Verify** the page loads successfully

4. Click on "Dashboard" in the navigation
5. Take a screenshot of the Dashboard page
6. **Verify** the Dashboard page loads

7. Select a currency pair (e.g., "EUR/USD") from the dropdown
8. Select a timeframe (e.g., "H1")
9. Click "Load Data" to load the chart
10. Take a screenshot of the loaded chart
11. **Verify** the price chart renders with candlestick data

### Chart Type Selector Tests

12. **Verify** the chart type selector dropdown is present with 4 options:
    - Candlestick
    - OHLC
    - Line
    - Area
13. Select "Line" from the chart type selector
14. Take a screenshot of the line chart
15. **Verify** the chart updates to display a line chart

16. Select "Area" from the chart type selector
17. Take a screenshot of the area chart
18. **Verify** the chart updates to display an area chart

19. Select "OHLC" from the chart type selector
20. Take a screenshot of the OHLC chart
21. **Verify** the chart updates to display OHLC bars

22. Select "Candlestick" from the chart type selector
23. **Verify** the chart returns to candlestick display

### Date Range Button Tests

24. **Verify** the date range buttons are present:
    - 1D, 5D, 1M, 3M, 6M, YTD, 1Y, All
25. Click the "1M" date range button
26. Take a screenshot after clicking 1M
27. **Verify** the chart updates with approximately 1 month of data

28. Click the "1Y" date range button
29. Take a screenshot after clicking 1Y
30. **Verify** the chart updates with approximately 1 year of data

### Volume Indicator Tests

31. **Verify** the volume toggle button/checkbox is present
32. Click the volume toggle to enable volume display
33. Take a screenshot with volume indicator
34. **Verify** volume bars appear below the main price chart

35. Click the volume toggle to disable volume display
36. **Verify** volume bars are hidden

### H4 Timeframe Test

37. **Verify** H4 (4-hour) timeframe is available in the timeframe selector
38. Select "H4" timeframe
39. Click "Load Data"
40. Take a screenshot of H4 timeframe chart
41. **Verify** the chart displays H4 data

### Chart Interaction Tests

42. Use mouse wheel to zoom the chart
43. **Verify** the chart zooms in/out smoothly
44. Double-click on the chart
45. **Verify** the chart resets to original zoom level
46. Take a final screenshot of the chart

## Success Criteria
- Dashboard loads with chart type selector showing 4 options
- Date range buttons (1D, 5D, 1M, 3M, 6M, YTD, 1Y, All) are visible and functional
- All 4 chart types render correctly (Candlestick, OHLC, Line, Area)
- Volume indicator can be toggled on/off
- Volume bars display below main chart when enabled
- H4 timeframe is available and loads data
- Chart supports zoom/pan interactions
- Double-click resets zoom
- 11 screenshots are taken throughout the test
