# E2E Test: Live Trading Dashboard

Test the Live Trading Dashboard functionality showing real-time trading activity including account metrics, active bots, open positions, recent trades, and system alerts.

## User Story

As a trader
I want to see a comprehensive dashboard of my live trading activity
So that I can monitor all my bots and positions at a glance

## Test Steps

1. Navigate to the `Application URL`
2. Take a screenshot of the initial state (Monitor page loads as Live Trading Dashboard)
3. **Verify** the page loads successfully with the title "Live Trading Dashboard"
4. **Verify** the navigation bar is present with links to Monitor, Strategy, and Account

5. **Verify** the Dashboard Header section contains:
   - Page title "Live Trading Dashboard"
   - Subtitle "Real-time monitoring"
   - Last updated timestamp
   - Refresh button
   - Dark mode toggle button
   - Connection status indicator

6. Take a screenshot of the Dashboard Header

7. **Verify** Account Metrics section displays:
   - Balance metric with dollar sign
   - Equity metric with dollar sign
   - Unrealized P/L (colored green if positive, red if negative)
   - Margin Level with percentage

8. Take a screenshot of the Account Metrics section

9. **Verify** Active Bots section is visible with:
   - Section title "Active Bots"
   - Bot status grid or empty state message

10. **Verify** Open Positions section displays:
    - Section title "Open Positions"
    - Either a table with trade data (Instrument, Side, Amount, Entry Price, P/L)
    - Or an empty state message if no open trades exist

11. **Verify** Recent Trades section displays:
    - Section title "Recent Trades"
    - Either an activity feed of closed trades
    - Or an empty state message if no history exists

12. **Verify** Alerts Panel is visible with:
    - Section title or icon for alerts
    - Alert list or "No active alerts" message

13. Take a screenshot of the full dashboard showing all sections

14. Click the Refresh button in the header
15. **Verify** the last updated timestamp changes after refresh
16. Take a screenshot after refresh showing updated timestamp

17. Click the Dark Mode toggle button
18. **Verify** the page applies dark theme styling (dark background, light text)
19. Take a screenshot of the dashboard in dark mode

20. Click the Dark Mode toggle button again
21. **Verify** the page returns to light theme
22. Take a screenshot of the dashboard in light mode

23. Resize browser to mobile viewport (375px width)
24. **Verify** the layout adapts to single column stack
25. Take a screenshot of the mobile layout

26. Resize browser to tablet viewport (768px width)
27. **Verify** the layout adapts to 2-column grid
28. Take a screenshot of the tablet layout

29. Resize browser back to desktop viewport (1280px width)
30. **Verify** the layout displays full multi-column grid
31. Take a final screenshot of the desktop layout

## Success Criteria

- Monitor page displays as "Live Trading Dashboard" with new title
- Account Metrics section shows Balance, Equity, P/L, and Margin Level
- Active Bots section shows bot status grid or empty state
- Open Positions section shows current open trades or empty state
- Recent Trades section shows last closed trades or empty state
- Alerts panel displays any active alerts or empty state
- Connection status indicator is visible (connected/reconnecting/disconnected)
- Last updated timestamp displays and updates with refresh
- Refresh button triggers immediate data refresh
- Dark mode toggle switches between light and dark themes
- Layout is responsive across mobile, tablet, and desktop viewports
- All loading states show appropriate content
- All empty states display appropriate messaging
- 12 screenshots are taken throughout the test
