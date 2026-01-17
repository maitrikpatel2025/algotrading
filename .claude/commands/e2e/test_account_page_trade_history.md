# E2E Test: Account Page - Trade History Terminology

Test that the Account page displays "Trade History" (not "Order History") to validate the bug fix for issue #19.

## User Story

As a trader
I want to see "Trade History" terminology on the Account page
So that the application uses correct trading industry terminology aligned with the FXOpen Web API documentation

## Test Steps

1. Navigate to the `Application URL`
2. Take a screenshot of the Home page
3. **Verify** the page loads successfully

4. Click on "Account" in the navigation bar
5. Wait for the Account page to load
6. Take a screenshot of the Account page showing both sections

7. **Verify** the page displays a section titled "Trade History" (NOT "Order History")
8. **Verify** the Trade History section header includes:
   - Title: "Trade History"
   - Subtitle: "Closed trades and transaction history"

9. **Verify** the Trade History section displays either:
   - A table with historical trade data if available
   - Or an empty state with appropriate messaging

10. Take a close-up screenshot of the Trade History section showing the correct terminology
11. **Verify** styling is consistent with the application style guide

## Success Criteria
- Account page displays "Trade History" section (not "Order History")
- Section header reads "Trade History" with appropriate subtitle
- No references to "Order History" appear on the Account page
- Styling follows the application's design system
- 3 screenshots are taken showing the correct terminology
