# E2E Test: Timeframe Selector with Session Persistence

Test the timeframe selector functionality including expanded timeframe options, session persistence, and visual enhancements.

## User Story

As a forex trader
I want to select from expanded timeframe options and have my preference remembered
So that I can analyze markets at my preferred time scale without re-selecting the timeframe on every visit

## Test Steps

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Take a screenshot of the initial state (Monitor page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links to Monitor, Strategy, and Account

5. Click on "Strategy" in the navigation
6. Take a screenshot of the Strategy page
7. **Verify** the Strategy page loads
8. **Verify** the timeframe selector dropdown is present

9. Click on the timeframe selector dropdown
10. Take a screenshot of the expanded dropdown
11. **Verify** the dropdown shows all 8 timeframe options:
    - 1 Min (M1)
    - 5 Min (M5)
    - 15 Min (M15)
    - 30 Min (M30)
    - 1 Hour (H1)
    - 4 Hour (H4)
    - 1 Day (D)
    - 1 Week (W1)

12. Select "H4" (4 Hour) timeframe from the dropdown
13. Click "Load Data" button
14. Take a screenshot after data loads
15. **Verify** the chart header displays a timeframe badge showing "H4"
16. **Verify** the price chart displays with candlestick data

17. Change the timeframe to "M15" (15 Min)
18. Wait for debounce (300ms) and data load
19. Take a screenshot after timeframe change
20. **Verify** the chart header badge updates to show "M15"
21. **Verify** the chart data reloads with the new timeframe

22. Refresh the page (F5 or browser refresh)
23. Wait for page to fully load
24. Take a screenshot after page refresh
25. **Verify** the timeframe selector shows "M15" as the selected value (persistence test)
26. **Verify** the timeframe preference was restored from localStorage

27. Select a different timeframe "H1" (1 Hour)
28. Click "Load Data" button
29. Take a screenshot of final state
30. **Verify** the chart loads successfully with the new timeframe
31. **Verify** the timeframe badge displays "H1"

## Success Criteria

- Strategy page loads without errors
- Timeframe dropdown displays all 8 expanded options (M1, M5, M15, M30, H1, H4, D, W1)
- Each timeframe option has a human-readable display label
- Timeframe badge pill is visible in the chart header
- Selected timeframe persists after page refresh via localStorage
- Chart data loads correctly for each selected timeframe
- Debouncing prevents rapid API calls when switching timeframes quickly
- Loading overlay displays during timeframe fetch
- 8 screenshots are taken documenting the test flow
