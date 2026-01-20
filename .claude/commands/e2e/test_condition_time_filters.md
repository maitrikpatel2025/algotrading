# E2E Test: Condition Time Filters

Test the time-based filtering functionality for trading conditions in the Forex Trading Dashboard application.

## User Story

As a forex trader
I want to add time-based filters to my conditions (e.g., "Only during London session")
So that I can restrict trading to specific market hours and avoid volatile or illiquid periods

## Test Steps

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Click on "Strategy" in the navigation
3. **Verify** the Strategy page loads
4. Take a screenshot of the Strategy page

5. Click "Load Data" button to load chart data
6. **Verify** the price chart renders with candlestick data
7. Take a screenshot after data loads

### Open Time Filter Dialog

8. Locate the Logic Panel on the right side of the page
9. **Verify** the Logic Panel is visible and expanded
10. Find the "Add Time Filter" button in the Logic Panel header area
11. Click the "Add Time Filter" button
12. **Verify** the Time Filter Dialog opens
13. Take a screenshot of the Time Filter Dialog

### Select Trading Session Template

14. **Verify** the dialog shows session template buttons (Sydney, Tokyo, London, New York)
15. Click on the "London" session template button
16. **Verify** the London session button appears selected/highlighted
17. **Verify** the visual timeline shows London session hours (07:00-16:00 UTC)
18. Take a screenshot of the selected London session

### Add Custom Time Window

19. Click "Add Custom Window" button
20. **Verify** a custom time window input appears
21. Enter start time "09:30" and end time "16:00"
22. **Verify** the timeline updates to show the custom window
23. Take a screenshot of the custom time window configuration

### Configure Days of Week

24. **Verify** day of week checkboxes are visible (Mon-Fri should be selected by default)
25. Uncheck "Friday" to exclude Friday trading
26. **Verify** Friday appears deselected
27. Take a screenshot of the day selection

### Change Timezone

28. **Verify** timezone selector is visible with options (UTC, EST, GMT, Local)
29. Select "EST" from the timezone dropdown
30. **Verify** the timeline updates to show times in EST
31. Take a screenshot of the timezone change

### Save Time Filter

32. Click the "Save" button in the dialog footer
33. **Verify** the dialog closes
34. **Verify** a Time Filter Badge appears in the Logic Panel
35. **Verify** the badge shows a summary (e.g., "London + Custom")
36. Take a screenshot showing the Time Filter Badge

### Test Exclude Mode

37. Click on the Time Filter Badge to reopen the dialog
38. **Verify** the dialog opens with previously saved configuration
39. Toggle the mode from "Include" to "Exclude"
40. **Verify** the mode toggle shows "Exclude" as active
41. **Verify** the visual timeline style changes (grayscale or warning color for excluded periods)
42. Take a screenshot of exclude mode

### Clear Time Filter

43. Click "Save" to save the exclude mode
44. **Verify** the badge color changes to indicate exclude mode (amber/warning)
45. Click the X button on the Time Filter Badge to clear the filter
46. **Verify** the Time Filter Badge disappears
47. **Verify** "Add Time Filter" button reappears
48. Take a screenshot showing cleared state

### Test Persistence

49. Click "Add Time Filter" button again
50. Select "New York" session template
51. Click "Save"
52. **Verify** the Time Filter Badge shows "New York"
53. Refresh the page (F5 or navigate away and back)
54. **Verify** the Time Filter Badge still shows "New York" after page reload
55. Take a screenshot showing persistence after reload

### Test Logic Integration

56. Add an indicator to the chart (drag EMA from the Indicator Library)
57. **Verify** a condition is created in the Logic Panel
58. Click "Test Logic" button
59. **Verify** the Test Logic dialog shows time filter status
60. **Verify** the time filter evaluation result is displayed (active/inactive based on current time)
61. Take a screenshot of Test Logic with time filter status

## Success Criteria

- Time Filter dialog opens from Logic Panel
- Trading session templates are selectable (Sydney, Tokyo, London, New York)
- Visual timeline correctly displays selected session hours
- Custom time windows can be added with start/end times
- Day of week selection works with Mon-Fri default
- Timezone selector changes time display
- Time filter badge shows summary after saving
- Include/Exclude mode toggle works
- Time filter persists after page reload
- Time filter status shows in Test Logic evaluation
- 12+ screenshots are taken documenting the full flow
