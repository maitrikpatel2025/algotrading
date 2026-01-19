# E2E Test: Indicator Library Panel

Test the indicator library panel functionality in the Forex Trading Dashboard Strategy page.

## User Story

As a forex trader
I want to see a categorized library of available indicators in a left sidebar panel
So that I can easily find and select indicators to add to my strategy

## Test Steps

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Take a screenshot of the initial state (Monitor page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links to Monitor, Strategy, and Account

5. Click on "Strategy" in the navigation
6. Take a screenshot of the Strategy page with indicator library panel
7. **Verify** the Strategy page loads
8. **Verify** the indicator library panel is visible on the left side

9. **Verify** the following panel elements are present:
   - Panel header with "Indicators" title
   - Collapse button (chevron icon)
   - Search input with placeholder "Search indicators..."

10. **Verify** all 5 category headers are present:
    - Trend
    - Momentum
    - Volatility
    - Volume
    - Custom

11. **Verify** the required Trend indicators are present:
    - SMA (Simple Moving Average)
    - EMA (Exponential Moving Average)
    - MACD (Moving Average Convergence Divergence)
    - ADX (Average Directional Index)

12. **Verify** the required Momentum indicators are present:
    - RSI (Relative Strength Index)
    - Stochastic
    - CCI (Commodity Channel Index)
    - Williams %R

13. **Verify** the required Volatility indicators are present:
    - Bollinger Bands
    - ATR (Average True Range)
    - Keltner Channel

14. **Verify** the required Volume indicators are present:
    - OBV (On Balance Volume)
    - Volume Profile

15. Take a screenshot showing all indicators expanded

16. Type "RSI" in the search input
17. Take a screenshot of filtered results
18. **Verify** only RSI indicator is visible in the list
19. **Verify** other indicators (like SMA, MACD) are not visible

20. Clear the search input by clicking the X button
21. **Verify** all indicators are visible again

22. Click on the "Trend" category header
23. **Verify** the Trend category collapses (indicators hidden)
24. Take a screenshot showing collapsed Trend category
25. Click on the "Trend" category header again
26. **Verify** the Trend category expands (indicators visible)

27. Click the collapse button to collapse the entire panel
28. Take a screenshot of the collapsed panel
29. **Verify** the panel is in collapsed state (narrow bar with expand icon)

30. Click on the collapsed panel to expand it
31. **Verify** the panel is back to expanded state
32. Take a screenshot of the re-expanded panel

33. Hover over the "SMA" indicator item
34. **Verify** a tooltip appears showing the indicator description

## Success Criteria

- Strategy page loads with indicator library panel visible on the left
- Panel header displays "Indicators" title
- Search bar filters indicators across all categories in real-time
- All 5 categories are present: Trend, Momentum, Volatility, Volume, Custom
- All 13 required indicators are available:
  - Trend: SMA, EMA, MACD, ADX (4)
  - Momentum: RSI, Stochastic, CCI, Williams %R (4)
  - Volatility: Bollinger Bands, ATR, Keltner Channel (3)
  - Volume: OBV, Volume Profile (2)
- Categories expand/collapse on click with smooth animation
- Panel can be collapsed to a narrow bar to maximize chart space
- Panel can be expanded from collapsed state
- Indicator tooltips display on hover
- 8 screenshots are taken documenting the full test flow
