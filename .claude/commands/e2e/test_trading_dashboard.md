# E2E Test: Trading Strategy

Test the main trading strategy functionality in the Forex Trading Dashboard application.

## User Story

As a trader  
I want to view price charts and technical analysis for currency pairs  
So that I can make informed trading decisions

## Test Steps

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Take a screenshot of the initial state (Monitor page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links to Monitor, Strategy, and Account

5. Click on "Strategy" in the navigation
6. Take a screenshot of the Strategy page
7. **Verify** the Strategy page loads
8. **Verify** the following elements are present:
   - Pair selector dropdown (EUR/USD, GBP/JPY, etc.)
   - Timeframe selector dropdown (M5, M15, H1, etc.)
   - Load Data button
   - Price chart area (empty state initially)

9. Select a currency pair (e.g., "EUR/USD") from the dropdown
10. Select a timeframe (e.g., "H1")
11. Click "Load Data" button
12. Take a screenshot of the pair selection
13. **Verify** the price chart updates with candlestick data
14. **Verify** technical analysis section shows support/resistance levels

15. Change the candle count using the count selector
16. **Verify** the chart updates to display the requested number of candles
17. Take a screenshot of the chart with technical analysis

## Success Criteria
- Monitor page loads as initial landing page
- Strategy navigation works
- Pair selector displays available currency pairs
- Timeframe selector displays available timeframes
- Price chart renders candlestick data
- Technical analysis data displays
- 4 screenshots are taken
