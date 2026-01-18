# E2E Test: Bot Start/Stop Control

Test the trading bot start/stop control functionality in the Forex Trading Dashboard application.

## User Story

As a trader
I want to start and stop my trading bot from the Monitor UI
So that I can quickly respond to market conditions and manage my automated trading without needing terminal access

## Test Steps

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Take a screenshot of the initial state (Monitor page with BotStatus component)
3. **Verify** the page loads successfully
4. **Verify** the BotStatus component is visible on the Monitor page

5. **Verify** the control buttons are visible:
   - Start Bot button (with Play icon)
   - Stop Bot button (with Square icon)

6. **Verify** button states when bot is stopped:
   - Start Bot button should be enabled (green, clickable)
   - Stop Bot button should be disabled (grayed out)

7. Take a screenshot of the stopped state with control buttons

8. **Verify** the Configuration panel:
   - Click on the "Configuration" accordion header
   - **Verify** the panel expands showing:
     - Strategy dropdown (default: "Bollinger Bands Strategy")
     - Timeframe dropdown (default: "M1")
     - Trading Pairs badges from config

9. Take a screenshot of the expanded configuration panel

10. **Test Starting the Bot:**
    - Click the "Start Bot" button
    - **Verify** the button shows loading spinner with "Starting..." text
    - **Verify** a success toast notification appears: "Bot started successfully"
    - **Verify** the status badge changes to "Running" (green with pulse animation)
    - **Verify** the Start button becomes disabled
    - **Verify** the Stop button becomes enabled (red)
    - **Verify** the Configuration panel is no longer visible (bot is running)

11. Take a screenshot of the running state

12. **Verify** PID is displayed (optional advanced info)

13. **Test Stopping the Bot:**
    - Click the "Stop Bot" button
    - **Verify** a confirmation dialog appears with:
      - Title: "Stop Trading Bot"
      - Message: "Are you sure you want to stop the trading bot? Any active monitoring will be stopped."
      - Cancel and Confirm buttons

14. Take a screenshot of the confirmation dialog

15. **Test Canceling Stop:**
    - Click the "Cancel" button in the dialog
    - **Verify** the dialog closes
    - **Verify** the bot is still running (status badge shows "Running")

16. **Test Confirming Stop:**
    - Click the "Stop Bot" button again
    - Click the "Confirm" button in the dialog
    - **Verify** the button shows loading spinner with "Stopping..." text
    - **Verify** a success toast notification appears: "Bot stopped successfully"
    - **Verify** the status badge changes to "Stopped" (gray)
    - **Verify** the Start button becomes enabled
    - **Verify** the Stop button becomes disabled
    - **Verify** the Configuration panel reappears

17. Take a screenshot of the stopped state after stopping

18. **Test Toast Notification Dismissal:**
    - **Verify** toast notification has a close button (X icon)
    - Click the close button
    - **Verify** the toast notification disappears

19. Wait 5 seconds and observe that the component auto-refreshes

20. Take a final screenshot showing the refreshed state

## Error Handling Tests

21. **Test Start Error Handling (if applicable):**
    - If bot is already running and start is attempted
    - **Verify** error toast appears with appropriate message

22. **Test Stop Error Handling (if applicable):**
    - If bot is not running and stop is attempted
    - **Verify** error toast appears with appropriate message

## Success Criteria

- Monitor page loads with BotStatus component visible
- Start/Stop buttons are present and styled correctly
- Button states update based on bot status (enabled/disabled)
- Configuration panel expands/collapses correctly when bot is stopped
- Configuration options (strategy, timeframe) are selectable
- Start button triggers bot start with loading spinner
- Stop button shows confirmation dialog before stopping
- Confirmation dialog has Cancel and Confirm buttons
- Success/error toast notifications appear after operations
- Status badge updates correctly (Stopped -> Running -> Stopped)
- PID is displayed when bot is running
- Component auto-refreshes without manual intervention
- At least 7 screenshots are taken
- No console errors related to bot control API

## API Endpoints Tested

- `POST /api/bot/start` - Start the trading bot
- `POST /api/bot/stop` - Stop the trading bot
- `GET /api/bot/status` - Get current bot status (includes can_start, can_stop flags)
