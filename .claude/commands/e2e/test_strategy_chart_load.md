# E2E Test: Strategy Chart Load

Test the Strategy page chart loading functionality in the Forex Trading Dashboard application, validating that the chart data loads successfully with the retry mechanism for transient API errors.

## User Story

As a trader
I want to load price charts for currency pairs on the Strategy page
So that I can view candlestick data and technical analysis for trading decisions

## Test Steps

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Take a screenshot of the initial state (Monitor page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links to Monitor, Strategy, and Account

5. Click on "Strategy" in the navigation
6. Take a screenshot of the Strategy page
7. **Verify** the Strategy page loads with:
   - Currency pair selector dropdown
   - Timeframe selector dropdown
   - "Load Data" button
   - Chart area (empty state initially)

8. Select a currency pair from the dropdown (e.g., "EUR_USD")
9. Select a timeframe from the dropdown (e.g., "H1")
10. Take a screenshot of the selected options

11. Click the "Load Data" button
12. Wait for the chart data to load (loading indicator completes)
13. Take a screenshot after loading

14. **Verify** the chart loads successfully:
    - Candlestick chart is visible in the chart area
    - No error message is displayed (e.g., "Unable to Load Data" or "503 error")
    - The chart shows price data with OHLC candles

15. **Verify** the technical analysis section displays:
    - Support and resistance levels (or appropriate message if not available)

16. Change the candle count using the count selector
17. Click "Load Data" again to refresh with new count
18. **Verify** the chart updates with the new number of candles

19. Take a final screenshot of the complete Strategy page with chart data

## Success Criteria
- Strategy page loads successfully via navigation
- Currency pair and timeframe selectors work correctly
- Load Data button triggers chart data loading
- Candlestick chart renders with price data (no 503 errors)
- No error messages about API unavailability are displayed
- Technical analysis section displays correctly
- Chart updates when count is changed
- 5 screenshots are taken throughout the test
- Application remains responsive throughout the test

## Notes
- This test validates that the retry mechanism for transient API errors (503) is working correctly
- The chart should load successfully without showing "The external trading API is currently unavailable" errors
- If the external API is genuinely down for an extended period, the test may still fail, but transient errors should be handled by the retry logic
