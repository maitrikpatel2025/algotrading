# E2E Test: Save Strategy

Test the save strategy functionality in the Forex Trading Dashboard application.

## User Story

As a trader
I want to save my strategy with a name and description
So that I can reuse it later for backtesting or live trading

## Test Steps

### Initial Setup

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Click on "Strategy" in the navigation
3. **Verify** the Strategy page loads successfully
4. Take a screenshot of the initial Strategy page

### Load Strategy Data

5. Select a currency pair (e.g., "EUR/USD") from the dropdown
6. Select a timeframe (e.g., "H1")
7. Click "Load Data" button
8. **Verify** the price chart loads with candlestick data
9. Take a screenshot of the loaded chart

### Open Save Dialog

10. Click the "Save Strategy" button in the header area
11. **Verify** the Save Strategy dialog opens
12. Take a screenshot of the Save Strategy dialog
13. **Verify** the dialog contains:
    - Strategy Name input field (required)
    - Description textarea (optional)
    - Tags input field (optional)
    - Cancel button
    - Save button

### Validate Required Field

14. Leave the Strategy Name field empty
15. **Verify** the Save button is disabled
16. Enter a strategy name that exceeds 50 characters
17. **Verify** the character counter shows the limit and prevents excess input
18. Clear the name field

### Enter Valid Strategy Data

19. Enter a valid strategy name: "My Test Strategy"
20. Enter a description: "A test strategy for E2E validation"
21. Enter tags: "test, e2e, validation"
22. **Verify** the Save button is now enabled
23. Take a screenshot of the filled form

### Save Strategy

24. Click the Save button
25. **Verify** the dialog closes
26. **Verify** a success toast notification appears with message containing "saved successfully"
27. Take a screenshot of the success toast

### Test Duplicate Name Warning

28. Click the "Save Strategy" button again
29. Enter the same strategy name: "My Test Strategy"
30. Click the Save button
31. **Verify** a confirmation dialog appears asking about overwriting
32. Take a screenshot of the overwrite confirmation dialog
33. Click "Cancel" on the confirmation dialog
34. **Verify** the Save Strategy dialog remains open
35. Click "Cancel" on the Save Strategy dialog to close it

### Verify Draft Auto-save (Optional)

36. Make a change to the strategy (e.g., change timeframe)
37. Wait for at least 60 seconds or reload the page
38. **Verify** a draft recovery prompt appears (if applicable)
39. Take a screenshot of the recovery prompt (if shown)

## Success Criteria

- Save Strategy button is visible in the Strategy page header
- Save Strategy dialog opens with required fields
- Strategy Name field is required with max 50 characters
- Description field is optional with max 500 characters
- Tags field is optional
- Save button is disabled when name is empty
- Successful save shows toast notification
- Duplicate name triggers overwrite confirmation dialog
- 6-8 screenshots are captured documenting the flow
