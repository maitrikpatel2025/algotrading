# E2E Test: Market Headlines

Test the Monitor page functionality including market headlines in the Forex Trading Dashboard.

## User Story

As a trader  
I want to see market headlines and bot status  
So that I can stay informed about market news and my trading bot activity

## Test Steps

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Take a screenshot of the initial state
3. **Verify** the page title or header contains "Forex" or "Monitor" branding

4. **Verify** the Headlines section is present:
   - Headlines section header is visible
   - At least one headline is displayed (or a "No headlines" message)
   
5. Take a screenshot of the headlines section

6. **Verify** the Bot Status section is present with:
   - Status badge (Running/Stopped)
   - Metrics cards (Uptime, Last Signal, etc.)

7. Take a screenshot of the Bot Status section
8. **Verify** the metrics display correctly

9. **Verify** navigation options are available:
   - Links to Strategy and Account pages

10. Take a screenshot of the complete Monitor page

## Success Criteria
- Monitor page loads successfully (via redirect from `/`)
- Headlines section is present and functional
- Bot Status displays correctly
- Navigation to other pages is accessible
- All values display correctly (not errors or "undefined")
- 4 screenshots are taken
