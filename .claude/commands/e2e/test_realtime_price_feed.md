# E2E Test: Real-Time Price Feed

Test the Real-Time Price Feed component on the Monitor page displaying live forex prices for user-selected currency pairs.

## User Story

As a forex trader
I want to see live prices for my watched currency pairs
So that I can stay informed of market movements

## Test Steps

1. Navigate to the `Application URL`
2. Take a screenshot of the initial Monitor page state
3. **Verify** the page loads successfully with the title "Live Trading Dashboard"

4. **Verify** Price Feed card is visible on the Monitor page with:
   - Card header showing "Price Feed" title
   - Latency indicator showing connection status
   - "Edit Watchlist" button visible

5. Take a screenshot of the Price Feed card header

6. **Verify** default watchlist displays with at least 3 major pairs:
   - EUR_USD should be present
   - GBP_USD should be present
   - USD_JPY should be present

7. **Verify** each price row displays all required data:
   - Pair name (e.g., "EUR/USD")
   - Bid price
   - Ask price
   - Spread in pips
   - Change in pips (positive or negative)
   - Change percentage
   - High of day
   - Low of day

8. Take a screenshot showing price data for all watchlist pairs

9. Wait 2-3 seconds for a price update cycle
10. **Verify** prices are updating (timestamp or latency indicator changes)

11. **Verify** latency indicator shows data freshness:
    - Green indicator for < 500ms latency
    - Or yellow indicator for 500ms-2000ms latency
    - Shows "Live" text when connected

12. Take a screenshot of the latency indicator

13. Click the "Edit Watchlist" button
14. **Verify** watchlist editor modal opens with:
    - Modal title or header
    - Search/filter input
    - List of available pairs grouped by category (Major, Minor, Exotic)
    - Currently watched pairs shown with remove (X) button

15. Take a screenshot of the watchlist editor modal

16. Search for "AUD" in the search input
17. **Verify** pairs are filtered to show AUD-related pairs

18. Click on a pair (e.g., AUD_USD) to add it to the watchlist
19. **Verify** the pair is added to the watchlist

20. Take a screenshot showing the updated watchlist with the new pair

21. Click the X button on one of the pairs to remove it
22. **Verify** the pair is removed from the watchlist

23. Close the watchlist editor modal (click outside or close button)
24. **Verify** the Price Feed card reflects the updated watchlist

25. Take a screenshot of the updated Price Feed card

26. Click on a price row (any currency pair)
27. **Verify** navigation occurs to the Strategy page with the pair pre-selected
28. **Verify** URL contains the pair query parameter (e.g., ?pair=EUR_USD)

29. Take a screenshot of the Strategy page with pre-selected pair

30. Navigate back to the Monitor page
31. **Verify** the watchlist persists (shows same pairs as before navigation)

32. Take a screenshot confirming watchlist persistence

33. Refresh the page (F5 or reload)
34. **Verify** the watchlist persists after refresh (localStorage)

35. Take a screenshot confirming watchlist persists after refresh

36. Resize browser to mobile viewport (375px width)
37. **Verify** the Price Feed card adapts to mobile layout:
    - Price data is readable on smaller screens
    - Pair names are visible
    - Key metrics (Bid, Ask, Change) are visible

38. Take a screenshot of mobile layout

39. Resize browser to tablet viewport (768px width)
40. **Verify** the Price Feed card displays properly on tablet

41. Take a screenshot of tablet layout

42. Resize browser back to desktop viewport (1280px width)
43. Take a final screenshot of the desktop layout

44. Toggle dark mode
45. **Verify** Price Feed card has proper dark mode styling:
    - Dark background on card
    - Light text for readability
    - Color flash animations still visible

46. Take a screenshot of Price Feed in dark mode

## Success Criteria

- Price Feed card is visible on Monitor page with header showing "Price Feed"
- Default watchlist contains at least 3 major pairs (EUR_USD, GBP_USD, USD_JPY)
- Each row displays: Pair, Bid, Ask, Spread, Change (pips), Change (%), High, Low
- Price updates are visible (data refreshes periodically)
- Latency indicator shows current data freshness in milliseconds
- "Edit Watchlist" button opens modal to add/remove pairs
- Clicking a pair row navigates to Strategy page with that pair selected
- Watchlist persists across page refreshes (localStorage)
- Layout is responsive across mobile, tablet, and desktop viewports
- Dark mode styling is applied correctly
- Loading skeleton shown during initial data fetch (if visible)
- 12+ screenshots are taken throughout the test
