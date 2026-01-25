# E2E Test: View Trade History

Test the enhanced Trade History feature on the Account page with advanced filtering, pagination, P/L summaries, and CSV export.

## User Story

As a trader
I want to see my recent closed trades with filtering and analysis capabilities
So that I can review what happened and learn from outcomes

## Test Steps

1. Navigate to the `Application URL`
2. Take a screenshot of the initial state
3. **Verify** the page loads successfully

4. Click on "Account" in the navigation
5. Take a screenshot of the Account page
6. **Verify** the Account page loads with the title "Account"

### Trade History Table Verification

7. **Verify** the Trade History section is visible with header "Trade History"
8. **Verify** Trade History table displays the required columns:
   - Date/Time
   - Pair (Instrument)
   - Direction (Side)
   - Entry (Entry Price)
   - Exit (Exit Price)
   - P/L (Realized P/L)
   - Duration
   - Exit Reason
   - Bot
9. Take a screenshot of the Trade History table showing all columns

### P/L Summary Verification

10. **Verify** the P/L Summary section is visible above the Trade History table
11. **Verify** P/L Summary displays:
    - Daily P/L with trade count
    - Weekly P/L with trade count
    - Total P/L for filtered period
12. **Verify** P/L values are color-coded (green for profit, red for loss)
13. Take a screenshot of the P/L Summary section

### Filter Controls Verification

14. **Verify** Trade History Filters section is visible with:
    - Date range inputs (Start Date, End Date)
    - Bot dropdown filter
    - Pair dropdown filter
    - Direction toggle (Both/Long/Short)
    - Outcome toggle (All/Winners/Losers)
    - Clear filters button
15. Take a screenshot of the filter controls

### Date Range Filter Test

16. If date range inputs are visible, change the date range to a custom period
17. **Verify** the Trade History table updates with filtered results
18. **Verify** P/L Summary updates to reflect the filtered period
19. Take a screenshot after applying date filter

### Direction Filter Test

20. Click on "Long" direction filter button
21. **Verify** table shows only Long/Buy trades (if any exist)
22. **Verify** P/L Summary updates accordingly
23. Click on "Short" direction filter button
24. **Verify** table shows only Short/Sell trades (if any exist)
25. Click on "Both" to reset direction filter

### Outcome Filter Test

26. Click on "Winners" outcome filter button
27. **Verify** table shows only trades with positive P/L (if any exist)
28. Click on "Losers" outcome filter button
29. **Verify** table shows only trades with negative P/L (if any exist)
30. Click on "All" to reset outcome filter
31. Take a screenshot showing filter toggles

### Pagination Test

32. **Verify** pagination controls are visible with:
    - Page size selector (25/50/100/All)
    - Pagination info showing "Showing X-Y of Z trades"
    - First/Previous/Next/Last page buttons
33. If more than 25 trades exist:
    - Change page size to 25
    - **Verify** only 25 trades are displayed per page
    - Click Next page button
    - **Verify** page changes and shows next set of trades
34. Take a screenshot of pagination controls

### Column Sorting Test

35. Click on "Date/Time" column header
36. **Verify** trades are sorted by date (ascending or descending)
37. Click on "Date/Time" column header again
38. **Verify** sort direction toggles
39. Click on "P/L" column header
40. **Verify** trades are sorted by P/L value
41. Take a screenshot showing sorted table

### CSV Export Test

42. **Verify** "Export CSV" button is visible in the Trade History header
43. Click the "Export CSV" button
44. **Verify** a CSV file is downloaded (check browser download or file system)
45. Take a screenshot after export action

### Clear Filters Test

46. Apply multiple filters (e.g., direction=Long, outcome=Winners)
47. **Verify** active filter count badge shows number of active filters
48. Click "Clear" filters button
49. **Verify** all filters are reset to defaults
50. **Verify** table shows all trades again
51. Take a screenshot showing cleared filters

### Empty State Test

52. If filters can be applied that result in no trades:
    - Apply filters to show empty results
    - **Verify** empty state message is displayed
    - **Verify** "No trades match the current filters" or similar message

### Final Verification

53. Take a final screenshot of the complete Trade History section
54. **Verify** styling is consistent with the rest of the application

## Success Criteria

- Navigation bar includes Account link
- Account page is accessible via navigation
- Trade History section is visible with enhanced table
- Table displays all 9 required columns: Date/Time, Pair, Direction, Entry, Exit, P/L, Duration, Exit Reason, Bot
- P/L Summary section displays daily, weekly, and total P/L with color coding
- Filter controls are functional:
  - Date range filter updates table
  - Bot dropdown filters by bot name
  - Pair dropdown filters by trading pair
  - Direction toggle filters by Long/Short/Both
  - Outcome toggle filters by Winners/Losers/All
  - Clear filters resets all filters
- Pagination works with configurable page sizes (25/50/100/All)
- Column sorting works for Date/Time and P/L columns
- CSV export downloads file with all filtered trade data
- Active filter count badge displays correctly
- Empty state is shown when no trades match filters
- P/L values are color-coded (green=profit, red=loss)
- Direction badges are color-coded (green=Long, red=Short)
- Styling is consistent with application style guide
- Minimum 6 screenshots are taken documenting the feature
