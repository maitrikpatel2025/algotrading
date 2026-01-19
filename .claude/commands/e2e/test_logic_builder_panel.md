# E2E Test: Logic Builder Panel

Test the Logic Builder Panel functionality in the Forex Trading Dashboard application, including four-section layout, trade direction integration, resize functionality, and condition management.

## User Story

As a forex trader
I want to see a dedicated logic panel for defining entry and exit conditions
So that I can construct the trading rules for my strategy with clear separation between long and short positions

## Test Steps

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Click on "Strategy" in the navigation
3. Take a screenshot of the Strategy page initial state
4. **Verify** the Logic Panel is visible on the right side of the page

### Trade Direction: Both (Default)

5. **Verify** the Trade Direction selector shows "Both" by default
6. **Verify** the Logic Panel displays all four sections:
   - "Long Entry Conditions" with green header
   - "Long Exit Conditions" with green header
   - "Short Entry Conditions" with red header
   - "Short Exit Conditions" with red header
7. Take a screenshot showing all four sections

### Trade Direction: Long Only

8. Click on the Trade Direction selector
9. Select "Long Only" option
10. **Verify** the Logic Panel now displays only two sections:
    - "Long Entry Conditions" with green header
    - "Long Exit Conditions" with green header
11. **Verify** the short sections are NOT visible
12. Take a screenshot of Long Only sections

### Trade Direction: Short Only

13. Click on the Trade Direction selector
14. Select "Short Only" option
15. **Verify** the Logic Panel now displays only two sections:
    - "Short Entry Conditions" with red header
    - "Short Exit Conditions" with red header
16. **Verify** the long sections are NOT visible
17. Take a screenshot of Short Only sections

### Empty State Text

18. Click on the Trade Direction selector
19. Select "Both" option to restore all sections
20. **Verify** each empty section shows the instructional text: "Drag indicators to chart or click Add Condition"
21. Take a screenshot of empty state

### Add Condition Buttons

22. **Verify** each section has an "Add Condition" button
23. Click "Add Condition" button in the "Long Entry Conditions" section
24. **Verify** a condition is created or a dialog opens
25. Take a screenshot after clicking Add Condition

### Panel Resize

26. Locate the resize handle on the left border of the Logic Panel
27. Drag the resize handle to the left to make the panel wider
28. **Verify** the panel width increases (within constraints)
29. Drag the resize handle to the right to make the panel narrower
30. **Verify** the panel width decreases (respects minimum width)
31. Take a screenshot showing resized panel

### Panel Collapse/Expand

32. Click the collapse button (ChevronRight icon) in the Logic Panel header
33. **Verify** the panel collapses to a minimal vertical bar
34. **Verify** icons for Entry and Exit are visible in collapsed state
35. Take a screenshot of collapsed panel
36. Click on the collapsed panel to expand it
37. **Verify** the panel expands back to full width
38. Take a screenshot of expanded panel

### Resize Persistence

39. Drag the resize handle to set a custom width
40. Note the panel width
41. Refresh the page
42. Navigate back to Strategy page
43. **Verify** the panel width is preserved from localStorage

## Success Criteria

- Logic Panel displays correct sections based on trade direction:
  - "Both": All four sections (Long Entry, Long Exit, Short Entry, Short Exit)
  - "Long Only": Long Entry and Long Exit sections only
  - "Short Only": Short Entry and Short Exit sections only
- Visual distinction is correct:
  - Long sections have green-tinted headers
  - Short sections have red-tinted headers
- Each section has an "Add Condition" button
- Empty state shows: "Drag indicators to chart or click Add Condition"
- Panel is resizable via left border drag handle
- Panel respects min (200px) and max (480px) width constraints
- Panel collapse/expand functionality works
- Panel width persists across page reloads
- 8+ screenshots are taken documenting the test flow
