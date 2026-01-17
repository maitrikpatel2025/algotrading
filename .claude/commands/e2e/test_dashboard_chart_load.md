# E2E Test: Dashboard Chart Load

Test the dashboard chart loading functionality in the Forex Trading Dashboard application, including error handling for failed data loads.

## User Story

As a trader
I want to load price charts and technical analysis for currency pairs
So that I can analyze market data for trading decisions, even when external data sources are unavailable

## Test Steps

1. Navigate to the `Application URL`
2. Take a screenshot of the initial state (Home page)
3. **Verify** the page loads successfully

4. Click on "Dashboard" in the navigation
5. Take a screenshot of the Dashboard page
6. **Verify** the Dashboard page loads with:
   - Currency pair selector dropdown
   - Timeframe selector dropdown
   - "Load Data" button

7. Select a currency pair from the dropdown (e.g., "EUR_USD")
8. Select a timeframe from the dropdown (e.g., "H1")
9. Take a screenshot of the selected options

10. Click the "Load Data" button
11. Wait for the loading to complete (button should stop showing "Loading...")
12. Take a screenshot of the result

13. **Verify** one of the following outcomes:
    - **Success case**: Price chart and/or technical analysis data is displayed
    - **Error case**: A user-friendly error message is displayed (NOT a raw 404 error or stack trace)

14. If an error is displayed, **Verify**:
    - The error message container is visible
    - The error message explains the issue (e.g., "Unable to Load Data")
    - There is helpful text indicating external data sources may be unavailable
    - The application does NOT crash or show a blank page

15. Take a final screenshot of the complete dashboard state

## Success Criteria
- Dashboard page loads without errors
- Pair and timeframe selectors are functional
- Load Data button triggers data loading
- On success: Chart and/or technical data displays correctly
- On error: User-friendly error message is shown (no raw HTTP errors)
- Application remains functional after error (can retry loading)
- 5 screenshots are taken

## Notes
- The external data sources (Investing.com, OpenFX API) may be unavailable during testing
- The test should pass regardless of whether data loads successfully or fails
- The key validation is that errors are handled gracefully with user-friendly messages
