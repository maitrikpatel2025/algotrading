# E2E Test: Strategy Library

Test the Strategy Library page functionality including listing, searching, filtering, sorting, and managing trading strategies.

## User Story

As a trader
I want to browse, search, and manage my saved trading strategies
So that I can organize and access my strategies efficiently

## Test Steps

1. Navigate to the `Application URL` (redirects to home page)
2. Take a screenshot of the initial state (Home page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links to Home, Strategy, and Account

5. Click on "Strategies" in the navigation
6. Wait for strategies API response
7. Take a screenshot of the Strategy Library page
8. **Verify** page header shows "Strategies"
9. **Verify** page description "Manage your trading strategies" is visible
10. **Verify** "New Strategy" button is visible
11. **Verify** "Import" button is visible

12. **Verify** the page shows either:
    - Strategy cards in a grid layout, OR
    - Empty state message "No strategies yet"

13. Locate the search input field (placeholder: "Search strategies...")
14. Take a screenshot showing the search input
15. **Verify** search input is visible and enabled

16. Type "test" into the search field
17. Wait for filtering to apply (500ms debounce)
18. Take a screenshot of filtered results
19. **Verify** search input contains "test"
20. **Verify** results are filtered (or shows "No strategies found")

21. Clear the search field
22. Wait for results to refresh
23. **Verify** all strategies are shown again (or empty state)

24. Locate direction filter buttons (All, Long, Short, Both)
25. Take a screenshot of the filter buttons
26. **Verify** "All" button appears selected by default

27. Click "Long" filter button
28. Wait for filter to apply
29. Take a screenshot with Long filter active
30. **Verify** "Long" button appears selected (highlighted styling)
31. **Verify** only long strategies are shown (or empty state)

32. Click "All" filter button
33. **Verify** "All" is selected and all strategies are shown

34. Locate the sort dropdown/select
35. Take a screenshot of sort options
36. **Verify** default sort is "Last Modified"

37. Change sort to "Name A-Z"
38. Wait for sort to apply
39. **Verify** sort dropdown shows "Name A-Z" selected
40. Take a screenshot of sorted results

41. Click "New Strategy" button
42. Wait for navigation
43. **Verify** URL changed to `/strategies/new`
44. Take a screenshot of Strategy Builder page
45. **Verify** Strategy Builder page loaded

46. Navigate back to `/strategies`
47. Wait for page load

48. Locate the first strategy card (if any exist)
49. If no strategies exist, skip to step 57

50. Hover over the strategy card
51. Take a screenshot on hover
52. **Verify** card shows hover effect (border color change)
53. **Verify** more options button (three dots) becomes visible

54. Click the more options button (three dots)
55. Take a screenshot of context menu
56. **Verify** menu appears with options: Edit, Duplicate, Export, Delete

57. Click on a strategy card (not the menu button)
58. Wait for navigation
59. **Verify** URL changed to `/strategies/{id}/edit`
60. Take a screenshot of edit page
61. **Verify** Strategy Builder loads with strategy data

62. If no strategies exist (empty state):
63. Navigate to `/strategies`
64. Take a screenshot of empty state
65. **Verify** empty state message is visible
66. **Verify** "Create Strategy" button is shown in empty state
67. Click "Create Strategy" button
68. **Verify** navigates to `/strategies/new`

## Success Criteria
- Strategy Library page loads without errors
- Search filters strategies correctly
- Direction filter works for all options
- Sort changes strategy order
- New Strategy navigation works
- Strategy cards display correctly with hover effects
- Context menu shows all actions (Edit, Duplicate, Export, Delete)
- Edit navigation loads strategy in builder
- Empty state displays when no strategies
- 5+ screenshots are taken
