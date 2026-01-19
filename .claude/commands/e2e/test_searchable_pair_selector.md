# E2E Test: Searchable Pair Selector

Test the searchable currency pair selector functionality in the Strategy page of the Forex Trading Dashboard application.

## User Story

As a forex trader
I want to quickly search and select currency pairs with categorization, recent history, and live spread information
So that I can efficiently navigate between pairs and make informed decisions based on trading costs

## Test Steps

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Take a screenshot of the initial state (Monitor page)
3. **Verify** the page loads successfully

4. Click on "Strategy" in the navigation
5. Take a screenshot of the Strategy page
6. **Verify** the Strategy page loads
7. **Verify** the pair selector component is present (should show search icon and dropdown trigger)

8. Click on the pair selector to open the dropdown
9. Take a screenshot of the open dropdown
10. **Verify** the dropdown opens with:
    - Search input field
    - Category headers (Majors, Minors, Exotics)
    - List of currency pairs under each category
    - Spread display next to pairs (may show loading indicator or spread value)

11. Type "EUR" in the search input
12. Take a screenshot of the filtered results
13. **Verify** only pairs containing "EUR" are displayed
14. **Verify** matching "EUR" text is highlighted in the results

15. Clear the search input
16. **Verify** all pairs are displayed again with category headers

17. Select "GBP_USD" from the Majors category
18. Take a screenshot after selection
19. **Verify** the dropdown closes
20. **Verify** "GBP_USD" is now shown as the selected pair

21. Reopen the pair selector dropdown
22. **Verify** "GBP_USD" appears in the Recent section at the top
23. **Verify** "GBP_USD" shows a checkmark indicator as the selected pair

24. Click "Load Data" button to load technical data
25. Wait for data to load
26. Take a screenshot with loaded data

27. Open the pair selector again
28. Select a different pair (e.g., "EUR_JPY")
29. **Verify** a confirmation dialog appears warning about resetting indicators
30. Take a screenshot of the confirmation dialog

31. Click "Cancel" on the confirmation dialog
32. **Verify** the dialog closes
33. **Verify** the selected pair remains "GBP_USD"

34. Open the pair selector again
35. Select "EUR_JPY" again
36. On the confirmation dialog, click "Confirm"
37. **Verify** the pair changes to "EUR_JPY"
38. Take a screenshot showing the pair changed

39. Test keyboard navigation:
    - Open the pair selector
    - Press ArrowDown to move selection
    - Press ArrowUp to move selection back
    - Press Enter to select
    - **Verify** keyboard navigation works correctly

40. Press Escape key while dropdown is open
41. **Verify** the dropdown closes without changing selection

42. Take a final screenshot of the Strategy page

## Success Criteria
- Pair selector component renders correctly with search input
- Dropdown opens and displays categorized pairs (Majors, Minors, Exotics)
- Search filtering works with debounced input
- Matching search text is highlighted
- Recent pairs section appears after selection
- Selected pair shows checkmark indicator
- Spread display is visible (value or loading state)
- Confirmation dialog appears when changing pair with data loaded
- Cancel on dialog preserves original selection
- Confirm on dialog changes the pair
- Keyboard navigation works (Arrow keys, Enter, Escape)
- Minimum row height appears touch-friendly (44px)
- 8+ screenshots are taken documenting the test flow
