# Bug: Rename Open Trades and Trade History Components on Account Page

## Metadata
issue_number: `93`
adw_id: `5c1da8e9`
issue_json: `{"number":93,"title":"bug open trades and trade history rename","body":"using adw_sdlc_iso\n\n/bug\n\nupdate for account page update the open trades and trade history rename order history to the trade history based on the documentation available in AI doc for API use that particular API trading API and then update the back end and the front end Make sure for the frontend styling is used the style guide and keep the style consistent"}`

## Bug Description
The Account page currently displays "Order History" terminology in some places, but according to trading industry standards and FXOpen API documentation (POST /api/v2/tradehistory), the correct terminology should be "Trade History". Additionally, there may be inconsistencies in how "Open Trades" is displayed throughout the Account page components.

The bug report requests verification that both "Open Trades" and "Trade History" naming is consistent throughout the Account page frontend and backend, following the API documentation and trading industry standards where:
- **Orders**: Instructions to buy/sell (can be pending, cancelled, or executed)
- **Trades**: Executed transactions (filled orders that resulted in positions)

Expected behavior: All references should use "Open Trades" for active positions and "Trade History" for historical executed trades.
Actual behavior: The naming may not be fully consistent across all UI elements and component text.

## Problem Statement
Ensure consistent terminology across the Account page by verifying that "Open Trades" and "Trade History" are used correctly in all UI text, component names, and labels. The previous feature implementation (bbdb5a41) already renamed the component from OrderHistory.jsx to TradeHistory.jsx, but we need to verify that all user-facing text and component headers consistently use this terminology.

## Solution Statement
Audit the Account page components (Account.jsx, OpenTrades.jsx, TradeHistory.jsx) to ensure all user-facing text, headers, labels, and descriptions consistently use "Open Trades" and "Trade History" terminology. Update any remaining references to "Order History" to "Trade History". Ensure the styling remains consistent with the application's Precision Swiss design system.

## Steps to Reproduce
1. Navigate to http://localhost:3000/account
2. Observe the section headers and component titles
3. Check for any inconsistencies in terminology (e.g., "Order History" vs "Trade History")
4. Verify the component headers, descriptions, and empty state messages

## Root Cause Analysis
Previous implementations may have left some references to "Order History" in user-facing text, or there may be inconsistencies in how "Open Trades" and "Trade History" are displayed. The component rename from OrderHistory.jsx to TradeHistory.jsx was completed in feature bbdb5a41, but a full audit is needed to ensure all UI text follows the correct terminology.

## Relevant Files
Use these files to fix the bug:

- `app/client/src/pages/Account.jsx` - Account page component that renders both OpenTrades and TradeHistory sections; verify page title and descriptions use correct terminology
- `app/client/src/components/OpenTrades.jsx` - Component displaying active positions; verify card title, subtitle, and empty state messages use "Open Trades" consistently
- `app/client/src/components/TradeHistory.jsx` - Component displaying historical trades; verify card title, subtitle, and empty state messages use "Trade History" consistently (not "Order History")
- `ai_docs/ui_style_guide.md` - Reference for ensuring consistent styling following Precision Swiss design system
- `ai_docs/FXOpen_Web_API_Documentation.md` - Reference for correct API terminology (POST /api/v2/tradehistory)

### New Files

- `.claude/commands/e2e/test_account_page_terminology.md` - New E2E test to verify correct terminology is displayed on the Account page

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Read and understand current implementation
- Read `app/client/src/pages/Account.jsx` to understand the current page structure and any references to trade sections
- Read `app/client/src/components/OpenTrades.jsx` to verify "Open Trades" terminology is used consistently
- Read `app/client/src/components/TradeHistory.jsx` to check for any remaining "Order History" references
- Read `ai_docs/ui_style_guide.md` to understand styling requirements for cards, headers, and text

### Step 2: Audit and update Account.jsx
- Verify the page description uses correct terminology ("open trades" and "trade history")
- Ensure any comments or documentation strings use the correct terminology
- Confirm component imports and usage reflect the correct naming (TradeHistory, not OrderHistory)

### Step 3: Audit and update OpenTrades.jsx
- Verify the card title uses "Open Trades" (not "Open Positions" or other variations)
- Verify the card subtitle/description uses appropriate language
- Check empty state messages for consistency
- Ensure all user-facing text follows the Precision Swiss design system style guide

### Step 4: Audit and update TradeHistory.jsx
- Verify the card title uses "Trade History" (not "Order History")
- Verify the card subtitle/description uses "Closed trades and transaction history" or similar appropriate language
- Check empty state messages use "trade history" not "order history"
- Verify error messages reference "Trade History" correctly
- Ensure all user-facing text follows the Precision Swiss design system style guide

### Step 5: Create E2E test specification
- Read `.claude/commands/e2e/test_account_page.md` and `.claude/commands/test_e2e.md` to understand the E2E test format
- Create `.claude/commands/e2e/test_account_page_terminology.md` that validates:
  - Account page displays "Open Trades" section header
  - Account page displays "Trade History" section header (not "Order History")
  - Both sections show appropriate subtitles and descriptions
  - Empty states use correct terminology
  - Error states use correct terminology
- The test should include screenshots proving the correct terminology is displayed

### Step 6: Run validation commands
- Execute all validation commands listed below to ensure the bug is fixed with zero regressions

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

- `cd app/client && npm run build` - Run frontend build to validate the bug is fixed with zero regressions (must complete without errors)
- `cd app/server && uv run pytest` - Run server tests to validate the bug is fixed with zero regressions (must pass all tests)
- Read `.claude/commands/test_e2e.md`, then read and execute your new E2E `.claude/commands/e2e/test_account_page_terminology.md` test file to validate the correct terminology is displayed on the Account page

## Notes

### Terminology Standards
From FXOpen Web API Documentation and trading industry standards:
- **Orders**: Instructions to buy/sell (can be pending, cancelled, or executed)
- **Trades**: Executed transactions (filled orders that resulted in positions)

Therefore:
- "Open Trades" = Currently active positions
- "Trade History" = Historical executed trades (from POST /api/v2/tradehistory endpoint)

### Previous Related Work
- Feature bfd1a7d1: Initial Account page implementation with OpenTrades and TradeHistory components
- Feature bbdb5a41: Renamed OrderHistory.jsx to TradeHistory.jsx and updated imports

This bug fix ensures the terminology is fully consistent throughout all user-facing text.

### Design Consistency Requirements
From `ai_docs/ui_style_guide.md` (Precision Swiss Design System):
- Card titles: Use `.card-title` class with font-weight-600
- Card subtitles: Use small text with `.text-xs` and `.text-muted-foreground`
- Empty states: Should include icon, primary message, and secondary descriptive text
- All text should follow the design system's typography scale and color tokens

### Surgical Approach
This is a terminology audit and correction task. Focus exclusively on:
1. Verifying correct terminology in user-facing text
2. Updating any remaining "Order History" references to "Trade History"
3. Ensuring consistent use of "Open Trades" throughout
4. Maintaining existing styling and functionality

Do not:
- Refactor component structure
- Change existing functionality
- Modify styling beyond what's required for consistency
- Add new features or capabilities
