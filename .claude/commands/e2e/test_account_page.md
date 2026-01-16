# E2E Test: Account Page

Test the Account page functionality showing open trades and order history in the Forex Trading Dashboard application.

## User Story

As a trader
I want to view my open trades and complete transaction trade history on a dedicated Account page
So that I can monitor my active positions and review my trading history in one place

## Test Steps

1. Navigate to the `Application URL`
2. Take a screenshot of the initial state (Home page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links to Home, Dashboard, and Account

5. Click on "Account" in the navigation
6. Take a screenshot of the Account page
7. **Verify** the Account page loads with the title "Account"
8. **Verify** the Open Trades section is visible with appropriate header
9. **Verify** the Order History section is visible with appropriate header

10. **Verify** Open Trades section displays either:
    - A table with trade data (columns: Instrument, Side, Amount, Entry Price, P/L, Margin, SL, TP)
    - Or an empty state message if no open trades exist

11. **Verify** Order History section displays either:
    - A table with historical trade data
    - Or an empty state message if no history exists

12. Take a screenshot of the full Account page showing both sections
13. **Verify** the styling is consistent with the rest of the application (cards, tables follow style guide)

## Success Criteria
- Navigation bar includes Account link
- Account page is accessible via navigation
- Open Trades section is visible
- Order History section is visible
- Page displays loading states while fetching data
- Empty states are shown when no data exists
- Styling is consistent with application style guide
- 3 screenshots are taken
