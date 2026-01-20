# E2E Test: Strategy Builder Layout

Test the updated Strategy Builder page layout with the three-column design, page header bar, control bar, and improved responsive behavior.

## User Story

As a trader
I want a well-organized three-column layout with clear separation between indicators, chart, and logic building
So that I can efficiently analyze charts, add indicators, and build trading conditions all in one view

## Test Steps

### Desktop Layout Test (>1280px)

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Click on "Strategy" in the navigation
3. Resize the browser to desktop size (1920x1080)
4. Take a screenshot of the Strategy page at desktop resolution

5. **Verify** the Page Header Bar elements:
   - Header bar is displayed below the navigation
   - Editable strategy name field is present (shows "Untitled Strategy" by default or loaded name)
   - Action buttons are visible: Save Draft, Duplicate, Export JSON
   - Header bar spans full width with proper border-bottom separation
   - Proper spacing following UI style guide (py-4, px-6, gap-4)

6. **Verify** the Control Bar elements:
   - Control bar is displayed below the header bar
   - Currency pair selector (PairSelector) is present
   - Timeframe selector is displayed as button group (not dropdown): 1m, 5m, 15m, 1h, 4h, 1d
   - Active indicators section displays chips/tags when indicators are active
   - Settings/layout toggle buttons are present
   - Proper spacing (py-3, px-6, gap-4)

7. **Verify** the three-column layout:
   - Left sidebar (IndicatorLibrary) is visible with ~280px width
   - Center area (Chart) fills remaining space
   - Right sidebar (LogicPanel) is visible with ~320px width
   - Proper gap spacing between columns (gap-6)
   - All three columns visible at desktop breakpoint

### Chart and Data Loading Test

8. Select a currency pair (e.g., "EUR/USD") from the control bar
9. Click a timeframe button (e.g., "1h")
10. Click "Load Data" button
11. Wait for data to load
12. Take a screenshot of the loaded data

13. **Verify** data loading:
    - Price chart displays candlestick data in center column
    - Technicals section displays below the chart
    - Chart fills the center column appropriately
    - No layout shifts or overlapping

### Active Indicators Test

14. Drag an indicator (e.g., "RSI") from the left sidebar onto the chart
15. Take a screenshot with the indicator active
16. **Verify** active indicator chip appears in Control Bar:
    - Chip displays indicator name with color stripe on left border
    - X button is visible on the chip for removal
    - Clicking the chip opens indicator settings dialog

17. Add a second indicator (e.g., "Moving Average")
18. **Verify** both indicators display as chips in the Control Bar
19. Click the X button on one chip
20. **Verify** indicator is removed from both the Control Bar and the chart

### Sidebar Collapse Test

21. Click the collapse button on the left sidebar (IndicatorLibrary)
22. Take a screenshot of the collapsed left sidebar
23. **Verify** sidebar collapses to minimal width (~40px)
24. **Verify** expand icon is visible in collapsed state
25. **Verify** chart expands to use the additional space
26. **Verify** transition is smooth (transition-all duration-200)

27. Click the collapse button on the right sidebar (LogicPanel)
28. Take a screenshot with both sidebars collapsed
29. **Verify** right sidebar collapses to minimal width (~40px)
30. **Verify** chart now has maximum horizontal space

31. Expand both sidebars again
32. **Verify** sidebars restore to original width smoothly

### Tablet Layout Test (768px - 1024px)

33. Resize browser to tablet size (768x1024)
34. Take a screenshot at tablet resolution
35. **Verify** responsive behavior:
    - Two-column layout: chart + right panel visible
    - Left sidebar hidden (collapsible overlay mode)
    - Control bar elements wrap gracefully (flex-wrap)
    - Timeframe buttons may stack or become scrollable

### Mobile Layout Test (<768px)

36. Resize browser to mobile size (375x667)
37. Take a screenshot at mobile resolution
38. **Verify** mobile-specific elements:
    - Both sidebars are hidden
    - Single column layout with chart as main content
    - Mobile floating action buttons visible at bottom
    - Buttons positioned at bottom-6 with proper spacing
    - Touch targets are adequate size (w-14 h-14 / 44px minimum)

39. Click the left floating button (Indicator Library)
40. Take a screenshot of the mobile indicator panel overlay
41. **Verify** panel opens as overlay with backdrop
42. **Verify** backdrop is semi-transparent (bg-black/50)
43. Click backdrop to close
44. **Verify** panel closes smoothly

45. Click the right floating button (Logic Panel)
46. Take a screenshot of the mobile logic panel overlay
47. **Verify** panel opens from right side
48. Click backdrop to close

### Strategy Name Editing Test

49. Click on the strategy name in the header bar
50. Take a screenshot of the editing state
51. **Verify** name field becomes editable (input field)
52. Type a new name "My Test Strategy"
53. Click outside or press Enter to save
54. **Verify** the new name is displayed

### Action Buttons Test

55. Click "Save Draft" button
56. **Verify** save dialog opens or save action triggers
57. Click "Duplicate" button (when strategy is loaded)
58. **Verify** duplicate action works appropriately
59. Click "Export JSON" button (when strategy is loaded)
60. **Verify** export downloads a JSON file

### Empty State Test

61. Navigate back to Strategy page (or reload without data)
62. Ensure no data is loaded
63. Take a screenshot of the empty state
64. **Verify** empty state layout:
    - Three-column layout still visible
    - Empty state message in center column
    - Proper vertical padding (py-20 lg:py-24)
    - Feature badges are well-spaced

## Success Criteria

- Page Header Bar displays with editable strategy name and action buttons (Save Draft, Duplicate, Export JSON)
- Control Bar shows currency pair selector, timeframe buttons (not dropdown), and active indicator chips
- Three-column layout with proper sidebar widths: left ~280px, right ~320px
- Active indicators display as removable chips with color stripe in Control Bar
- Sidebars collapse/expand with smooth animations (200ms)
- Responsive: three columns on desktop, two on tablet, single on mobile
- Mobile floating buttons are properly positioned at bottom-6
- Mobile panel overlays work with backdrop
- All existing functionality preserved (no regressions)
- Spacing follows 4px base unit system (gap-4, gap-6, py-3, py-4, px-6)
- At least 15 screenshots are taken to validate layout at different states and breakpoints
