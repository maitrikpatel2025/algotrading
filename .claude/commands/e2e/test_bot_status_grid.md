# E2E Test: Bot Status Grid

Test the Bot Status Grid functionality showing all trading bots in an interactive card-based grid with real-time status, P/L, and sorting capabilities.

## User Story

As a trader
I want to see all my trading bots in a grid with their current status
So that I can quickly identify which bots are running, paused, or have issues

## Test Steps

1. Navigate to the `Application URL`
2. Take a screenshot of the initial state (Monitor page loads as Live Trading Dashboard)
3. **Verify** the page loads successfully with the title "Live Trading Dashboard"

4. **Verify** Bot Status Grid section is visible with:
   - Section title "Bot Status Grid"
   - Subtitle showing bot count (e.g., "3 bots")
   - Sort controls dropdown

5. Take a screenshot of the Bot Status Grid section

6. **Verify** each bot card displays the following information:
   - Bot name
   - Status badge (Running, Paused, Stopped, or Error)
   - Currency pair
   - Current P/L (colored green if positive, red if negative)
   - Open position information (if any)

7. **Verify** status color coding is correct:
   - Green for "Running" status
   - Yellow for "Paused" status
   - Gray for "Stopped" status
   - Red for "Error" status

8. Take a screenshot showing status color coding

9. **Verify** sort controls are present with options:
   - Sort by Name
   - Sort by Status
   - Sort by P/L
   - Sort by Last Activity
   - Sort direction toggle (ascending/descending)

10. Click the sort by "Name" option
11. **Verify** bots are sorted alphabetically by name
12. Take a screenshot of the sorted grid

13. Click the sort direction toggle to reverse the order
14. **Verify** bots are now sorted in reverse alphabetical order

15. Click the sort by "P/L" option
16. **Verify** bots are sorted by P/L (highest to lowest)
17. Take a screenshot of the P/L sorted grid

18. Click the sort by "Status" option
19. **Verify** bots are sorted by status priority (running > paused > stopped > error)

20. Click on a bot card to expand it
21. **Verify** the expanded view shows detailed information:
    - Strategy name
    - Detailed position information (if any)
    - Error message (if in error state)
    - Last activity timestamp

22. Take a screenshot of the expanded bot card

23. Click on the expanded card again to collapse it
24. **Verify** the card collapses back to normal view

25. Wait 5 seconds for auto-refresh
26. **Verify** the "Last updated" timestamp in the dashboard header has updated
27. Take a screenshot showing the updated timestamp

28. Resize browser to mobile viewport (375px width)
29. **Verify** the grid adapts to single column layout
30. Take a screenshot of the mobile layout

31. Resize browser to tablet viewport (768px width)
32. **Verify** the grid adapts to 2-column layout
33. Take a screenshot of the tablet layout

34. Resize browser back to desktop viewport (1280px width)
35. **Verify** the grid displays 3-column layout
36. Take a final screenshot of the desktop layout

## Success Criteria

- Bot Status Grid displays on the Monitor page with title and bot count
- Each bot card shows: Name, Status, Currency Pair, Current P/L, Open Position
- Status badges use correct color coding (green=running, yellow=paused, gray=stopped, red=error)
- Sort controls work for Name, Status, P/L, and Last Activity
- Sort direction can be toggled between ascending and descending
- Clicking a card expands to show detailed view
- Clicking again collapses the card
- Grid auto-refreshes every 5 seconds (timestamp updates)
- Layout is responsive: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- Dark mode toggle works and applies theme to bot cards
- Loading skeleton displays while data is being fetched
- Empty state displays "No bots configured" when no bots exist
- All screenshots (12) are taken throughout the test
