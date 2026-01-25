# E2E Test: View Open Positions

Test the enhanced Open Positions functionality with real-time P/L, sortable columns, total summary, and manual close capability across both Monitor and Account pages.

## User Story

As a trader
I want to see all my currently open positions with live P/L
So that I can monitor exposure and performance

## Test Steps

1. Navigate to the `Application URL` (Monitor page)
2. Take a screenshot of the initial state (Monitor page loads as Live Trading Dashboard)
3. **Verify** the page loads successfully with the title "Live Trading Dashboard"

### Open Positions Section (Monitor Page)

4. **Verify** Open Positions section is visible with section title "Open Positions"
5. **Verify** the Open Positions table displays the following columns:
   - Instrument (Pair)
   - Side (Direction)
   - Amount (Size)
   - Entry Price
   - Current Price
   - P/L ($)
   - P/L (pips)
6. Take a screenshot of the Open Positions section on Monitor page
7. **Verify** P/L values have color coding (green for profit, red for loss)
8. **Verify** each position row is clickable (shows pointer cursor on hover)
9. **Verify** "View All" link is present to navigate to full positions view

### Navigation to Account Page

10. Click on "Account" in the navigation bar
11. **Verify** the Account page loads with the title "Account"
12. Take a screenshot of the Account page

### Open Trades Table (Account Page)

13. **Verify** Open Trades section is visible with section title "Open Trades"
14. **Verify** the Open Trades table displays all required columns:
    - Instrument (Pair)
    - Direction (Side)
    - Size (Amount)
    - Entry Price
    - Current Price
    - P/L ($)
    - P/L (pips)
    - SL (Stop Loss)
    - TP (Take Profit)
    - Duration
    - Bot Name
    - Close (Action button)
15. Take a screenshot of the full Open Trades table
16. **Verify** P/L values have color coding (green for profit, red for loss)

### Sorting Functionality

17. Click on the "P/L ($)" column header to sort
18. **Verify** a sort indicator (arrow icon) appears on the column header
19. **Verify** the table rows are sorted by P/L value
20. Take a screenshot showing sorted table with sort indicator
21. Click on the "P/L ($)" column header again to reverse sort order
22. **Verify** the sort indicator changes direction (ascending/descending)
23. Take a screenshot showing reversed sort order
24. Click on the "Duration" column header to sort by duration
25. **Verify** the sort indicator moves to the Duration column
26. Take a screenshot showing sort by Duration

### Total P/L Summary Row

27. Scroll to the bottom of the Open Trades table
28. **Verify** a Total P/L Summary row is displayed at the bottom
29. **Verify** the summary row shows:
    - Label "Total" or "Summary"
    - Aggregate P/L ($) value
    - Aggregate P/L (pips) value
30. **Verify** the summary row has distinct styling (different background or font weight)
31. Take a screenshot of the Total P/L Summary row

### Manual Close Button

32. **Verify** each position row has a Close button (X icon or "Close" text)
33. Hover over a Close button
34. **Verify** the Close button has a hover state (color change or tooltip)
35. Take a screenshot showing Close button hover state

### Close Position Dialog (if positions exist)

36. Click the Close button on any position row
37. **Verify** a confirmation dialog appears with:
    - Dialog title (e.g., "Close Position")
    - Position details (Pair, Direction, Size, Entry Price, Current P/L)
    - Confirm button
    - Cancel button
38. Take a screenshot of the Close Position confirmation dialog
39. Click the Cancel button
40. **Verify** the dialog closes without closing the position
41. **Verify** the position is still visible in the table

### Click-to-Chart Navigation

42. Navigate back to Monitor page by clicking "Monitor" in navigation
43. Click on a position row in the Open Positions section
44. **Verify** navigation occurs to Strategy page
45. **Verify** the chart loads with the position's currency pair selected
46. Take a screenshot of the Strategy page with position pair loaded

### Real-Time Updates Verification

47. Navigate back to Monitor page
48. Note the current P/L values displayed
49. Wait 10 seconds (polling interval)
50. **Verify** the "Last Updated" timestamp has changed (indicating data refresh)
51. Take a screenshot after data refresh

### Empty State (if no positions)

52. **Verify** if no positions exist, an appropriate empty state message is displayed:
    - "No open positions" or similar message
    - Message is centered and clearly visible
53. Take a screenshot of empty state (if applicable)

### Responsive Layout

54. Resize browser to tablet viewport (768px width)
55. **Verify** the Open Trades table adapts (horizontal scroll or column hiding)
56. Take a screenshot of tablet layout

57. Resize browser back to desktop viewport (1280px width)
58. **Verify** the full table layout is restored
59. Take a final screenshot of desktop layout

## Success Criteria

- Open Positions section on Monitor page displays all required columns including Current Price and P/L (pips)
- Open Trades table on Account page displays all 12 columns as specified
- P/L values are color coded (green for profit, red for loss)
- All columns are sortable with visible sort indicators
- Sort order can be toggled between ascending and descending
- Total P/L Summary row displays aggregate values at table bottom
- Close button is visible on each position row
- Close confirmation dialog shows position details before closing
- Cancel button in dialog prevents position close
- Clicking position row navigates to Strategy page with correct pair
- Data updates reflect via polling (10-second interval)
- Empty state displays appropriate message when no positions exist
- Layout is responsive on tablet and desktop viewports
- 15+ screenshots are taken throughout the test
