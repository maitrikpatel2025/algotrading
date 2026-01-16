# E2E Test: Trading Dashboard

Test the main trading dashboard functionality in the Forex Trading Dashboard application.

## User Story

As a trader  
I want to view price charts and technical analysis for currency pairs  
So that I can make informed trading decisions

## Test Steps

1. Navigate to the `Application URL`
2. Take a screenshot of the initial state (Home page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links to Home and Dashboard
5. **Verify** account summary section is visible (Balance, Margin, P/L)

6. Click on "Dashboard" in the navigation
7. Take a screenshot of the Dashboard page
8. **Verify** the Dashboard page loads
9. **Verify** the following elements are present:
   - Pair selector dropdown (EUR/USD, GBP/JPY, etc.)
   - Timeframe selector dropdown (M5, M15, H1, etc.)
   - Candle count input
   - Price chart area

10. Select a currency pair (e.g., "EUR/USD") from the dropdown
11. Select a timeframe (e.g., "H1")
12. Take a screenshot of the pair selection
13. **Verify** the price chart updates with candlestick data
14. **Verify** technical analysis section shows support/resistance levels

15. Change the candle count to 50
16. **Verify** the chart updates to display the requested number of candles
17. Take a screenshot of the chart with technical analysis

## Success Criteria
- Home page loads with account summary
- Dashboard navigation works
- Pair selector displays available currency pairs
- Timeframe selector displays available timeframes
- Price chart renders candlestick data
- Technical analysis data displays
- 4 screenshots are taken
