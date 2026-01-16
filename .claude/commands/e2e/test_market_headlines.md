# E2E Test: Market Headlines and Account Summary

Test the home page functionality including market headlines and account summary in the Forex Trading Dashboard.

## User Story

As a trader  
I want to see market headlines and my account summary  
So that I can stay informed about market news and my trading position

## Test Steps

1. Navigate to the `Application URL` (Home page)
2. Take a screenshot of the initial state
3. **Verify** the page title or header contains "Forex Trading" or similar branding

4. **Verify** the Headlines section is present:
   - Headlines section header is visible
   - At least one headline is displayed (or a "No headlines" message)
   
5. Take a screenshot of the headlines section

6. **Verify** the Account Summary section is present with:
   - Account Balance field
   - Margin Used field
   - Unrealized P/L field
   - Free Margin field

7. Take a screenshot of the account summary section
8. **Verify** the values are formatted as numbers (currency values)

9. **Verify** navigation options are available:
   - Link or button to Dashboard

10. Take a screenshot of the complete home page

## Success Criteria
- Home page loads successfully
- Headlines section is present and functional
- Account summary displays financial information
- Navigation to other pages is accessible
- All values display correctly (not errors or "undefined")
- 4 screenshots are taken
