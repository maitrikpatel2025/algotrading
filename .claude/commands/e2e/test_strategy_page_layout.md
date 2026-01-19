# E2E Test: Strategy Page Layout

Test the redesigned Strategy page layout to ensure proper spacing, responsiveness, and that the page feels less crowded following the UI style guide.

## User Story

As a trader
I want a well-spaced and organized Strategy page layout
So that I can analyze charts and technical indicators without visual crowding

## Test Steps

### Desktop Layout Test (>1280px)

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Click on "Strategy" in the navigation
3. Resize the browser to desktop size (1920x1080)
4. Take a screenshot of the Strategy page at desktop resolution
5. **Verify** the following layout elements:
   - Left sidebar (IndicatorLibrary) is visible with proper width (~256px when expanded)
   - Right sidebar (LogicPanel) is visible with proper width (~288px when expanded)
   - Main content area has adequate breathing room between elements
   - Controls section card has proper padding (p-6 lg:p-8)
   - Page header has proper spacing (space-y-8)

6. **Verify** proper spacing in controls section:
   - Controls are well-spaced (gap-6)
   - Selected info badge has proper separation (mt-6 pt-6)
   - No elements feel cramped or overlapping

### Chart and Technicals Layout Test

7. Select a currency pair (e.g., "EUR/USD")
8. Select a timeframe (e.g., "H1")
9. Click "Load Data" button
10. Wait for data to load
11. Take a screenshot of the loaded data
12. **Verify** the new layout structure:
    - Price chart is displayed at full width (no longer constrained by sidebar)
    - Technicals section is displayed below the chart (not beside it)
    - Both chart and technicals have adequate vertical spacing between them (space-y-8)
    - Chart area feels spacious and uncluttered

### Sidebar Collapse Test

13. Click the collapse button on the left sidebar (IndicatorLibrary)
14. Take a screenshot of the collapsed left sidebar
15. **Verify** sidebar collapses to minimal width (~40px)
16. **Verify** chart expands to use the additional space
17. **Verify** transition is smooth (transition-all duration-200)

18. Click the collapse button on the right sidebar (LogicPanel)
19. Take a screenshot with both sidebars collapsed
20. **Verify** right sidebar collapses to minimal width (~40px)
21. **Verify** chart now has maximum horizontal space

22. Expand both sidebars again
23. **Verify** sidebars restore to original width smoothly

### Tablet Layout Test (768px - 1024px)

24. Resize browser to tablet size (768x1024)
25. Take a screenshot at tablet resolution
26. **Verify** responsive behavior:
    - Layout adapts gracefully
    - Sidebars are hidden on tablet (md:hidden becomes effective)
    - Main content takes full width
    - Controls remain accessible and well-spaced

### Mobile Layout Test (<768px)

27. Resize browser to mobile size (375x667)
28. Take a screenshot at mobile resolution
29. **Verify** mobile-specific elements:
    - Both sidebars are hidden
    - Mobile floating action buttons are visible at bottom
    - Buttons are well-positioned (bottom-6, proper spacing)
    - Buttons have adequate size (w-14 h-14) for touch targets
    - Buttons don't overlap with content

30. Scroll down the page
31. Take a screenshot while scrolled
32. **Verify** floating buttons remain fixed and don't obscure content

33. Click the left floating button (Indicator Library)
34. Take a screenshot of the mobile indicator panel overlay
35. **Verify** panel opens as overlay with backdrop
36. **Verify** backdrop is semi-transparent (bg-black/50)
37. Click backdrop to close
38. **Verify** panel closes smoothly

39. Click the right floating button (Logic Panel)
40. Take a screenshot of the mobile logic panel overlay
41. **Verify** panel opens from right side
42. Click backdrop to close

### Empty State Test

43. Navigate back to Strategy page (or reload)
44. Ensure no data is loaded
45. Take a screenshot of the empty state
46. **Verify** empty state layout:
    - Proper vertical padding (py-20 lg:py-24)
    - Icon is well-sized and centered
    - Text has proper spacing (mb-6, mb-3, mb-8)
    - Feature badges are well-spaced

### Error/Info Message Test

47. (If possible) Trigger an error by selecting an invalid pair or disconnecting
48. Take a screenshot of error display
49. **Verify** error cards have consistent padding (p-5)
50. **Verify** proper gap between icon and content (gap-4)

## Success Criteria

- Desktop layout provides adequate breathing room with proper spacing (following 4px base unit system)
- Chart gets full width priority, with technicals displayed below (not beside)
- Sidebars collapse/expand smoothly without affecting content readability
- Tablet layout adapts gracefully with sidebars hidden
- Mobile floating buttons are properly positioned (bottom-6) and don't overlap content
- Mobile panel overlays work correctly with backdrop
- Empty state has generous spacing (py-20 lg:py-24)
- All cards use consistent padding following style guide
- Page feels less crowded compared to previous three-column layout
- All spacing follows the 4px base unit system (space-6, space-8, etc.)
- At least 15 screenshots are taken to validate layout at different states and breakpoints
