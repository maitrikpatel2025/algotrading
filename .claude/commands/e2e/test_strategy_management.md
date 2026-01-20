# E2E Test: Strategy Management

Test the strategy management functionality in the Forex Trading Dashboard application, including loading, duplicating, deleting, exporting, and importing strategies.

## User Story

As a trader
I want to load, duplicate, delete, export, and import trading strategies
So that I can efficiently organize my strategy library, create variations of successful strategies, backup my work, and share strategies with others

## Prerequisites

- At least one saved strategy exists in the database (created via Save Strategy feature)
- The application is running on the default URL

## Test Steps

### Initial Setup

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Click on "Strategy" in the navigation
3. **Verify** the Strategy page loads successfully
4. Take a screenshot of the initial Strategy page

### Load Strategy Data and Save Initial Strategy

5. Select a currency pair (e.g., "EUR/USD") from the dropdown
6. Select a timeframe (e.g., "H1")
7. Click "Load Data" button
8. **Verify** the price chart loads with candlestick data
9. Click the "Save Strategy" button in the header area
10. Enter strategy name: "Test Strategy for Management"
11. Enter description: "E2E test strategy for management features"
12. Enter tags: "test, e2e, management"
13. Click the Save button
14. **Verify** success toast appears
15. Take a screenshot after saving

### Test Load Strategy Dialog

16. Click the "Load Strategy" button in the toolbar
17. **Verify** the Load Strategy dialog opens
18. Take a screenshot of the Load Strategy dialog
19. **Verify** the dialog contains:
    - Strategy list on the left side
    - Search input field
    - Sort dropdown
    - Direction filter (All, Long, Short, Both)
    - Preview panel on the right side
    - Load and Cancel buttons
20. **Verify** "Test Strategy for Management" appears in the list

### Test Search and Filter

21. Type "Test Strategy" in the search input
22. **Verify** the list filters to show matching strategies
23. Clear the search input
24. Click the direction filter button for "Long"
25. **Verify** the list filters to show only long strategies (or shows empty if none)
26. Click "All" to reset filter
27. Take a screenshot of filtered results

### Test Strategy Preview

28. Click on "Test Strategy for Management" in the list
29. **Verify** the preview panel shows strategy details:
    - Strategy name
    - Description
    - Tags
    - Currency pair
    - Timeframe
    - Trade direction
    - Indicator count
    - Condition count
30. Take a screenshot of the preview panel

### Load Strategy

31. With "Test Strategy for Management" selected, click "Load" button
32. **Verify** the dialog closes
33. **Verify** the strategy is loaded (check that strategy name appears in toolbar)
34. Take a screenshot of loaded strategy

### Test Duplicate Strategy

35. Click the "Duplicate" button in the toolbar
36. **Verify** success toast appears with message containing "duplicated"
37. **Verify** the new strategy name contains "Copy"
38. Take a screenshot after duplication

### Test Duplicate from Load Dialog

39. Click the "Load Strategy" button
40. Right-click on the original "Test Strategy for Management"
41. **Verify** context menu appears with Duplicate, Delete, Export options
42. Click "Duplicate" from context menu
43. **Verify** success toast appears
44. Take a screenshot of context menu interaction

### Test Delete Strategy (with Undo)

45. In the Load Strategy dialog, find "Test Strategy for Management - Copy"
46. Right-click and select "Delete"
47. **Verify** confirmation dialog appears asking to confirm deletion
48. Click "Delete" to confirm
49. **Verify** success toast appears with "Undo" option
50. Click "Undo" within 30 seconds
51. **Verify** strategy is restored to the list
52. Take a screenshot of undo functionality

### Test Delete Strategy (Confirmed)

53. Right-click on "Test Strategy for Management - Copy" again
54. Select "Delete"
55. Click "Delete" to confirm
56. Wait for undo timeout (or don't click undo)
57. **Verify** strategy is removed from the list
58. Close the Load Strategy dialog

### Test Export Strategy

59. Click the "Export" button in the toolbar
60. **Verify** a JSON file download is triggered
61. **Verify** the filename matches pattern: `strategy_[name]_[YYYYMMDD].json`
62. Take a screenshot (showing download notification if visible)

### Test Import Strategy Dialog

63. Click the "Import" button in the toolbar
64. **Verify** the Import Strategy dialog opens
65. Take a screenshot of the Import Strategy dialog
66. **Verify** the dialog contains:
    - File picker / drag-and-drop area
    - Preview panel (initially empty)
    - Import and Cancel buttons

### Test Import Validation

67. Note: For automated testing, use the exported file from step 59
68. Select the exported JSON file
69. **Verify** validation passes (no errors displayed)
70. **Verify** preview shows imported strategy details
71. Take a screenshot of import preview

### Test Import Name Conflict

72. Note: The imported strategy has the same name as existing
73. **Verify** name conflict warning appears
74. **Verify** options shown: Rename, Replace, Keep Both
75. Select "Keep Both" option
76. Click "Import" button
77. **Verify** success toast appears
78. **Verify** imported strategy has auto-renamed name (with number suffix)
79. Take a screenshot after successful import

### Cleanup

80. Click "Load Strategy" button
81. Delete test strategies created during this test
82. Close the dialog

## Success Criteria

- Load Strategy button is visible in the Strategy page toolbar
- Load Strategy dialog opens with list view and preview panel
- Search and filter functionality works correctly
- Strategy preview shows all relevant details
- Load button successfully loads strategy to the chart
- Duplicate creates copy with "- Copy" suffix
- Delete shows confirmation dialog
- Delete undo works within 30 seconds
- Export downloads JSON file with correct naming
- Import dialog shows file picker and preview
- Import validates JSON structure
- Import handles name conflicts with resolution options
- 12-15 screenshots are captured documenting the flow
