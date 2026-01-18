# E2E Test: Account Page - Trade History

Test the Trade History functionality on the Account page in the Forex Trading Dashboard application.

## User Story

As a trader
I want to view my historical trade data on the Account page
So that I can review my past trading activity including closed positions and transaction history fetched from the FXOpen Trade History API

## Test Steps

1. Navigate to the `Application URL`
2. Take a screenshot of the initial state (Home page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links to Home, Dashboard, and Account

5. Click on "Account" in the navigation
6. Take a screenshot of the Account page
7. **Verify** the Account page loads with the title "Account"
8. **Verify** the page description mentions "trade history" (not "order history")

9. **Verify** the Trade History section is visible with:
   - Header displaying "Trade History" (not "Order History")
   - Subtitle displaying "Closed trades and transaction history"
   - History icon in the header

10. **Verify** Trade History section displays either:
    - A table with historical trade data showing columns: Date, Instrument, Side, Amount, Entry Price, Exit Price, P/L
    - Or an empty state message: "No trade history" with "Your closed trades will appear here"

11. If trade history data is present:
    - **Verify** Date column displays formatted dates with time
    - **Verify** Instrument column shows trading pairs (e.g., EUR/USD)
    - **Verify** Side column shows Buy (green with up arrow) or Sell (red with down arrow)
    - **Verify** Amount column shows position sizes
    - **Verify** Entry Price and Exit Price columns show 5 decimal precision
    - **Verify** P/L column shows profit/loss with + for positive values (green) and negative values (red)

12. Take a screenshot of the Trade History section
13. **Verify** the styling matches the UI style guide:
    - Card layout with card-header and card-content
    - Table uses proper table classes
    - Colors use CSS variables (success, destructive, muted-foreground)
    - History icon from Lucide React

14. **Verify** no references to "Order History" appear anywhere on the page

## Success Criteria
- Account page is accessible via navigation
- Trade History section displays correct terminology (not "Order History")
- Trade History shows appropriate data or empty state
- Table columns are properly formatted
- Buy/Sell indicators are color-coded correctly
- Profit/Loss values are color-coded (green for profit, red for loss)
- Styling is consistent with application style guide
- No "Order History" terminology remains
- 2 screenshots are captured
