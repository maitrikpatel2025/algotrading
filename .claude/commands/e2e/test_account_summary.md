# E2E Test: Account Summary

Test the Account Summary functionality in the Forex Trading Dashboard application.

## User Story

As a trader
I want to see my account summary with key financial metrics
So that I can monitor my trading account status and available margin

## Test Steps

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Click on "Account" in the navigation
3. Take a screenshot of the Account page
4. **Verify** the Account page loads successfully without errors

5. **Verify** the Account Summary section is present:
   - Look for "Account Summary" heading or card
   - The section should NOT display the error message "Unable to load account data. Please try again later."

6. **Verify** the following account data fields are displayed:
   - Account Number (Id)
   - Balance (with $ prefix)
   - Equity (with $ prefix)
   - Profit (with $ prefix, may be positive or negative)
   - Margin (with $ prefix)
   - Margin Level (with % suffix)
   - Leverage (with "1:" prefix)

7. Take a screenshot of the Account Summary section

8. **Verify** the values are properly formatted:
   - Currency values show dollar signs ($)
   - Numbers are formatted with appropriate decimal places
   - Profit value shows + or - indicator for positive/negative values
   - Values are NOT showing "undefined", "null", or "-" for all fields

9. Take a screenshot of the complete Account page showing Account Summary, Open Trades, and Trade History

## Success Criteria

- Account page loads successfully (via navigation from Monitor)
- Account Summary section is visible (not showing error state)
- All 7 account data fields are displayed (Id, Balance, Equity, Profit, Margin, MarginLevel, Leverage)
- Values are properly formatted as currency/percentages
- No "Unable to load account data" error message is shown
- Open Trades section is visible
- Trade History section is visible
- 3 screenshots are taken

## Bug Fix Validation

This test validates the fix for Issue #111 where the `/api/account` endpoint was missing from the server. The expected behavior after the fix:

1. The `/api/account` endpoint returns account data from the OpenFX API
2. The frontend receives the data and displays it in the Account Summary component
3. No 404 errors appear in the browser console for `/api/account`
