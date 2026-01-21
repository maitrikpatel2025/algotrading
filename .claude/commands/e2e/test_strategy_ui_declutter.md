# E2E Test: Strategy UI Declutter

Test the decluttered Strategy Builder UI with collapsed sidebars by default and simplified header actions.

## User Story

As a trader
I want a clean, focused Strategy Builder interface
So that I can maximize chart visibility and reduce visual clutter when building trading strategies

## Test Steps

1. Navigate to the Application URL and wait for the page to load
2. Click on "Strategy" in the navigation bar to navigate to the Strategy page
3. Take a screenshot of the initial Strategy page state
4. **Verify** both sidebars are collapsed by default:
   - Left sidebar (Indicator Library) should be collapsed (~40px width)
   - Right sidebar (Logic Panel) should be collapsed or hidden
   - Chart area should occupy the majority of the viewport width
5. **Verify** the header bar layout is simplified:
   - Strategy name should be visible and editable
   - Save button should be prominently visible
   - A "More" dropdown or action menu should contain secondary actions
6. Take a screenshot of the collapsed sidebar state

7. Click the "More" dropdown/menu button in the header
8. Take a screenshot of the dropdown menu open
9. **Verify** the dropdown contains the following actions:
   - Load (or Load Strategy)
   - Import (or Import Strategy)
   - Duplicate (may be disabled if no strategy loaded)
   - Export (may be disabled if no strategy loaded)
10. Close the dropdown by clicking outside or pressing Escape

11. Find and click the left sidebar toggle button (Indicator Library toggle)
12. Take a screenshot of the expanded left sidebar
13. **Verify** the Indicator Library sidebar expands and shows indicator categories

14. Find and click the Logic panel toggle button
15. Take a screenshot of the expanded right sidebar (Logic Panel)
16. **Verify** the Logic Panel expands and shows condition sections

17. Reload the page to test persistence
18. **Verify** sidebar states are restored from localStorage:
   - If sidebars were expanded before reload, they should remain expanded
   - If user clears localStorage, sidebars should default to collapsed

19. Take a final screenshot showing the Strategy Builder with both sidebars expanded

## Success Criteria
- Sidebars are collapsed by default on first visit (no localStorage data)
- Header is decluttered with Save button prominent and other actions in dropdown
- "More" dropdown contains Load, Import, Duplicate, Export actions
- Sidebar toggle buttons work correctly to expand/collapse panels
- Sidebar states persist to localStorage
- Chart area is maximized when sidebars are collapsed
- All functionality remains accessible (no loss of features)
- 6 screenshots are taken documenting the UI states:
  1. Initial collapsed state
  2. Collapsed sidebars showing maximized chart
  3. More dropdown menu open
  4. Left sidebar expanded
  5. Right sidebar expanded
  6. Final state with both sidebars expanded
