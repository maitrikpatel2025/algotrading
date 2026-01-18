# E2E Test: Bot Status

Test the trading bot status dashboard functionality in the Forex Trading Dashboard application.

## User Story

As a trader
I want to see bot status so that I know if my automated trading is running
So that I can verify the bot is operational, monitor which pairs it's tracking, and understand its recent activity

## Test Steps

1. Navigate to the `Application URL`
2. Take a screenshot of the initial state (Home page)
3. **Verify** the page loads successfully
4. **Verify** the BotStatus component is visible on the Home page

5. **Verify** the status badge is displayed with one of the following states:
   - "Running" (green with pulse animation)
   - "Stopped" (gray)
   - "Paused" (yellow/warning)
   - "Error" (red)

6. **Verify** the metrics section displays the following cards:
   - Uptime (formatted as hours/minutes/seconds or "--" if not running)
   - Last Signal (relative time like "5m ago" or "--" if no signals)
   - Signals Today (count)
   - Trades Today (count)

7. Take a screenshot of the metrics section

8. **Verify** the Active Strategy section is present with:
   - Strategy name
   - Strategy description (if available)

9. **Verify** the Monitored Pairs section shows currency pair badges with:
   - Symbol (e.g., "GBPJPY")
   - Timeframe (e.g., "H1")

10. Take a screenshot of the full BotStatus component

11. Wait 5 seconds and observe that the component auto-refreshes (verify network request or UI update)

12. Take a final screenshot showing the refreshed state

## Success Criteria

- Home page loads with BotStatus component visible
- Status badge displays correctly with appropriate styling
- Metrics cards (Uptime, Last Signal, Signals Today, Trades Today) are present
- Active Strategy section displays strategy information
- Monitored Pairs section shows configured currency pairs as badges
- Component auto-refreshes without manual intervention
- 4 screenshots are taken
- No console errors related to bot status API
