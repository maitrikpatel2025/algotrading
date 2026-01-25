# E2E Test: Bot Controls

Test the Bot Controls functionality including Start, Pause, Stop, and Emergency Stop capabilities for trading bots.

## User Story

As a forex trader
I want comprehensive controls to start, pause, stop, and emergency stop my trading bots
So that I can manage my automated trading activity safely and respond quickly to market conditions

## Test Steps

1. Navigate to the `Application URL` (Monitor page)
2. Take a screenshot of the initial dashboard state
3. **Verify** the page loads successfully with the title "Live Trading Dashboard"
4. **Verify** the navigation bar is present with links to Monitor, Strategy, and Account

### Pre-Start Checklist Validation

5. Locate the BotStatus component in the dashboard
6. **Verify** a "Start Bot" button is visible when bot is stopped
7. Click the "Start Bot" button
8. Take a screenshot of the pre-start checklist dialog
9. **Verify** the pre-start checklist dialog displays with:
   - "Strategy assigned" checklist item
   - "Risk parameters set" checklist item
   - "Broker connected" checklist item
   - Status icons (check, x, or warning) for each item
   - Overall status indication
   - "Start Bot" button (enabled if all checks pass)
10. **Verify** the checklist items are color-coded:
    - Green for passed items
    - Red for failed items
    - Yellow for warning items

### Start Bot with Confirmation

11. **Verify** the "Start Bot" button in the dialog is enabled (if all checks pass)
12. Click the "Start Bot" button in the dialog
13. Take a screenshot of the confirmation dialog
14. **Verify** confirmation dialog displays: "Start [Bot Name]? It will begin trading with real money."
15. Click "Confirm" to start the bot
16. **Verify** a toast notification appears confirming bot started
17. Take a screenshot showing the bot in "Running" status
18. **Verify** the bot status changes to "Running" with:
    - Status badge shows "Running" with pulse animation
    - Started timestamp is displayed
    - Uptime counter starts

### Pause Bot with Duration Selection

19. Locate the "Pause" button on the running bot
20. **Verify** the "Pause" button is visible when bot is running
21. Click the "Pause" button
22. Take a screenshot of the pause duration dialog
23. **Verify** the pause duration dialog displays with options:
    - 15 minutes
    - 30 minutes
    - 1 hour
    - 2 hours
    - Custom duration input
    - Indefinite (no auto-resume)
24. **Verify** the dialog shows message about existing positions being managed
25. Select "30 minutes" duration option
26. Click "Pause Bot" button
27. Take a screenshot showing the bot in "Paused" status
28. **Verify** the bot status changes to "Paused" with:
    - Status badge shows "Paused" (yellow)
    - Pause timestamp is displayed
    - Resume countdown shows remaining time
    - "Resume" button appears

### Resume Bot from Paused State

29. Locate the "Resume" button on the paused bot
30. **Verify** the "Resume" button is visible when bot is paused
31. Click the "Resume" button
32. **Verify** a toast notification appears confirming bot resumed
33. Take a screenshot showing the bot in "Running" status again
34. **Verify** the bot status changes back to "Running"

### Stop Bot with Options

35. Locate the "Stop" button on the running bot
36. **Verify** the "Stop" button is visible when bot is running
37. Click the "Stop" button
38. Take a screenshot of the stop options dialog
39. **Verify** the stop options dialog displays with three options:
    - "Stop and close all positions at market" with warning
    - "Stop and keep positions open" with manual management note
    - "Stop after current position closes" with pending state note
40. **Verify** each option has clear explanation of implications
41. Select "Stop and keep positions open" option
42. Click "Stop Bot" button
43. Take a screenshot of the confirmation dialog
44. **Verify** confirmation dialog explains the selected option
45. Click "Confirm" to stop the bot
46. **Verify** a toast notification appears with final P/L summary
47. Take a screenshot showing the bot in "Stopped" status
48. **Verify** the bot status changes to "Stopped"

### Emergency Stop All Functionality

49. Scroll to the BotStatusGrid component header
50. **Verify** a prominent "Emergency Stop" button is visible (red, always visible)
51. Take a screenshot showing the Emergency Stop button location
52. Click the "Emergency Stop" button
53. Take a screenshot of the emergency stop confirmation dialog
54. **Verify** the confirmation dialog displays:
    - Warning icon
    - Message: "STOP ALL BOTS and CLOSE ALL POSITIONS immediately?"
    - Clear warning about market execution
55. Click "Confirm" to execute emergency stop
56. **Verify** loading state is shown during execution
57. Take a screenshot of the post-emergency summary
58. **Verify** the post-emergency summary shows:
    - Number of bots stopped
    - Number of positions closed
    - Total P/L realized
    - Detailed actions taken
59. **Verify** all bots are now showing "Stopped" status in the grid

### Bot Card Controls (Individual Bot)

60. Scroll to the BotStatusGrid
61. **Verify** each bot card displays control buttons based on status:
    - Start button for stopped bots
    - Pause/Stop buttons for running bots
    - Resume/Stop buttons for paused bots
62. Take a screenshot of a bot card showing control buttons
63. Click Start on a stopped bot card
64. **Verify** the pre-start checklist dialog appears
65. Cancel the dialog
66. Take a screenshot showing the dialog was dismissed

### Responsive Layout

67. Resize browser to mobile viewport (375px width)
68. **Verify** the Emergency Stop button remains visible and accessible
69. Take a screenshot of mobile layout with Emergency Stop button
70. Resize browser back to desktop viewport (1280px width)
71. Take a final screenshot of the complete dashboard

## Success Criteria

### Start Trading Bot
- "Start" button visible on bot card and BotStatus component when bot is stopped
- Pre-start checklist validates: Strategy assigned, Risk parameters set, Broker connected
- Confirmation dialog displays: "Start [Bot Name]? It will begin trading with real money."
- Bot status changes to "Running" with timestamp after successful start
- Toast notification confirms bot started

### Pause Trading Bot
- "Pause" button visible on running bot card and BotStatus component
- Paused bot status shows "Paused" with pause timestamp
- "Resume" button appears to restart trading
- Option to specify pause duration (15 min, 30 min, 1 hour, 2 hours, custom, indefinite)

### Stop Trading Bot
- "Stop" button visible on bot card and BotStatus component
- Options dialog shows three stop options with explanations
- Confirmation dialog explains implications of selected option
- Bot status changes to "Stopped" after stop completes
- Summary of final P/L displayed in toast notification

### Emergency Stop All
- Prominent "Emergency Stop" button visible in BotStatusGrid header (red, always visible)
- Single confirmation dialog: "STOP ALL BOTS and CLOSE ALL POSITIONS immediately?"
- All bots set to "Stopped" status after confirmation
- Post-emergency summary shows: positions closed, P/L realized, bots stopped
- Emergency Stop button remains accessible on mobile viewports

### General
- All dialogs follow consistent design patterns
- Toast notifications provide feedback for all actions
- Loading states shown during async operations
- Error states handled gracefully with clear messages
- 20+ screenshots captured throughout the test
