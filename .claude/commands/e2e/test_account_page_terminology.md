# E2E Test: Account Page Terminology

Test that the Account page uses correct trading terminology ("Open Trades" and "Trade History") throughout all user-facing text, headers, and empty state messages.

## User Story

As a trader
I want to see consistent and correct trading terminology on the Account page
So that I understand that "Open Trades" refers to active positions and "Trade History" refers to closed executed trades

## Test Steps

1. Navigate to the `Application URL`
2. Take a screenshot of the initial state (Home page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links to Home, Dashboard, and Account

5. Click on "Account" in the navigation
6. Take a screenshot of the Account page
7. **Verify** the Account page loads with the title "Account"
8. **Verify** the page description contains "open trades" and "trade history" (not "order history")

9. **Verify** the "Open Trades" section header is visible
10. **Verify** the "Open Trades" section subtitle reads "Currently active positions"
11. **Verify** if empty state is shown, it displays:
    - Main message: "No open trades"
    - Secondary message: "Your active positions will appear here"

12. **Verify** the "Trade History" section header is visible (not "Order History")
13. **Verify** the "Trade History" section subtitle reads "Closed trades and transaction history"
14. **Verify** if empty state is shown, it displays:
    - Main message: "No trade history"
    - Secondary message: "Your closed trades will appear here"

15. Take a screenshot of the full Account page showing both sections with correct terminology
16. **Verify** no instances of "Order History" appear anywhere on the page

17. If there is trade history data, **Verify** the error state (if present) references "Trade History" not "Order History"
18. Take a final screenshot documenting the correct terminology throughout the page

## Success Criteria
- Account page description uses "open trades" and "trade history" terminology
- Open Trades section header displays "Open Trades"
- Open Trades section subtitle displays "Currently active positions"
- Open Trades empty state uses "open trades" and "active positions" terminology
- Trade History section header displays "Trade History" (NOT "Order History")
- Trade History section subtitle displays "Closed trades and transaction history"
- Trade History empty state uses "trade history" and "closed trades" terminology
- No instances of "Order History" appear anywhere on the page
- Error states reference "Trade History" not "Order History"
- 3 screenshots are taken documenting correct terminology
