# E2E Test: Combine Conditions with AND/OR Logic

Test the condition grouping functionality in the Forex Trading Dashboard Strategy page. This feature allows users to combine multiple conditions using AND/OR operators to create complex, multi-factor trading rules.

## User Story

As a forex trader
I want to combine multiple conditions using AND/OR operators
So that I can create complex, multi-factor trading rules that capture nuanced market conditions

## Prerequisites

- Application must be running (frontend on localhost:3000, backend on localhost:8000)
- Price data should be loaded to enable indicator additions
- At least two indicators should be added to create conditions for grouping

## Test Steps

### Phase 1: Initial Setup

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Take a screenshot of the initial state
3. **Verify** the page loads successfully
4. Click on "Strategy" in the navigation
5. Take a screenshot of the Strategy page
6. **Verify** the Strategy page loads with:
   - Pair selector dropdown
   - Timeframe selector dropdown
   - Load Data button
   - Logic Panel visible on the right

7. Select a currency pair (e.g., "EUR/USD")
8. Select a timeframe (e.g., "H1")
9. Click "Load Data" button
10. **Verify** the price chart loads with candlestick data

### Phase 2: Add Multiple Conditions

11. Drag the "RSI" indicator from the Indicator Library panel onto the chart
12. Configure RSI with default parameters (period 14) and click "Add Indicator"
13. **Verify** RSI indicator appears on chart and a condition is auto-created
14. Drag the "EMA" indicator from the Indicator Library panel onto the chart
15. Configure EMA with period 50 and click "Add Indicator"
16. **Verify** EMA indicator appears on chart and a second condition is auto-created
17. Click "Add Condition" button in Long Entry section
18. Configure the third condition (e.g., Close Price crosses above EMA (50))
19. Take a screenshot showing three ungrouped conditions in Logic Panel
20. **Verify** all three conditions are displayed as separate condition blocks

### Phase 3: Create First Group with AND Operator

21. Click the checkbox on the first condition (RSI condition) to select it
22. Click the checkbox on the second condition (EMA condition) to select it
23. **Verify** "Group Selected" button appears when 2+ conditions are selected
24. Click the "Group Selected" button
25. Take a screenshot of the newly created group
26. **Verify** the two conditions are now wrapped in a group container with:
   - Visual bracket/border showing grouping
   - AND operator displayed between conditions
   - AND/OR toggle button visible
27. **Verify** the group has a subtle background color or border indicating grouping

### Phase 4: Toggle AND/OR Operator

28. Click on the AND/OR toggle button in the group
29. **Verify** the operator changes from AND to OR
30. Take a screenshot showing OR operator
31. **Verify** the badge/label now shows "OR" instead of "AND"
32. Click the toggle again to switch back to AND
33. **Verify** operator returns to AND

### Phase 5: Visual Grouping with Brackets

34. Hover over the condition group
35. Take a screenshot of the hover state
36. **Verify** the group container shows:
   - Clear visual boundary (border or bracket)
   - Depth indication (color or indentation)
   - Operator badge between conditions
37. **Verify** the grouped conditions are visually connected

### Phase 6: Drag-and-Drop within Groups

38. Click and drag the second condition in the group
39. Move it above the first condition within the group
40. Release the drag
41. Take a screenshot after reordering
42. **Verify** the conditions have swapped positions within the group
43. **Verify** the group structure remains intact

### Phase 7: Add Condition to Existing Group

44. Click "Add Condition" button inside the group (if available) OR drag the third condition into the group
45. Take a screenshot with three conditions in the group
46. **Verify** the group now contains three conditions
47. **Verify** AND/OR operators appear between all conditions in the group

### Phase 8: Create Nested Groups (Level 2)

48. Select two conditions within the existing group
49. Click "Create Sub-group" or equivalent button
50. Take a screenshot of the nested group structure
51. **Verify** a nested group is created within the parent group
52. **Verify** the nested group shows:
   - Increased indentation or different border style
   - Its own AND/OR toggle
   - Visual hierarchy indicating depth level 2

### Phase 9: Maximum Nesting Depth (Level 3)

53. Create another sub-group within the level 2 group (if conditions available)
54. Take a screenshot showing level 3 nesting
55. **Verify** nesting works up to 3 levels deep
56. Attempt to create another sub-group within the level 3 group
57. **Verify** the "Create Sub-group" button is disabled or hidden at max depth
58. **Verify** a message indicates maximum nesting depth reached

### Phase 10: Logic Tree View

59. Locate the view toggle button in the Logic Panel header
60. Click the tree view icon to switch to tree view mode
61. Take a screenshot of the tree view
62. **Verify** the tree view displays:
   - Root node for the section (e.g., "Long Entry")
   - AND/OR nodes for groups with operator labels
   - Leaf nodes for individual conditions
   - Connecting lines between nodes
   - Expand/collapse controls for groups
63. Click on a condition in the tree view
64. **Verify** the condition is highlighted or selected
65. Click the inline view icon to switch back to inline view
66. **Verify** the view returns to the standard inline display

### Phase 11: Test Logic Button

67. Locate the "Test Logic" button in the Logic Panel (section footer or header)
68. Click the "Test Logic" button
69. **Verify** the Test Logic dialog opens
70. Take a screenshot of the Test Logic dialog
71. **Verify** the dialog displays:
   - Header: "Test Logic - Long Entry Conditions" (or appropriate section)
   - Current candle data (OHLC values, timestamp)
   - Current indicator values (RSI value, EMA value)
   - Logic evaluation tree showing:
     - Each condition with pass/fail status (green checkmark or red X)
     - Group results with AND/OR evaluation
     - Final result (signal would/would not fire)
72. **Verify** color coding is correct:
   - Green checkmarks for conditions that pass
   - Red X for conditions that fail
73. Click "Close" button to dismiss the dialog

### Phase 12: Ungroup Conditions

74. Select the nested group (level 2 or 3)
75. Click the "Ungroup" button on the group
76. Take a screenshot after ungrouping
77. **Verify** the conditions are flattened back to the parent level
78. **Verify** the group wrapper is removed
79. **Verify** the conditions remain in the section

### Phase 13: Group Persistence

80. Note the current group structure
81. Refresh the page
82. Navigate back to Strategy page
83. Click "Load Data" to restore the chart
84. Take a screenshot of restored state
85. **Verify** the group structure is preserved from localStorage
86. **Verify** AND/OR operators are correct
87. **Verify** nesting structure matches pre-refresh state

### Phase 14: Delete Group with Conditions

88. Hover over a condition group
89. Click the delete button on the group header
90. **Verify** confirmation dialog appears asking whether to:
   - Delete group and all conditions
   - Keep conditions (ungroup only)
91. Click "Keep Conditions"
92. **Verify** the group is removed but conditions remain as ungrouped
93. Create a new group with two conditions
94. Click delete on the group
95. Click "Delete All" (or equivalent)
96. **Verify** both the group and its conditions are removed

### Phase 15: Edge Cases

97. Create a group with only 2 conditions
98. Delete one condition from the group
99. **Verify** the group auto-ungroups (or shows warning) when only 1 condition remains
100. Take a screenshot of the auto-ungroup behavior
101. Create a new group in the Short Entry section
102. Drag a condition from Long Entry to Short Entry
103. **Verify** the condition moves to the new section and is removed from any group
104. Take a screenshot of cross-section move

## Success Criteria

- Conditions can be selected and grouped using "Group Selected" button
- Visual grouping with brackets/boxes clearly shows logic structure
- AND/OR operator toggle switches between operators
- Operator badge displays current logical operator (AND/OR)
- Drag-and-drop reorders conditions within groups correctly
- Conditions can be added to existing groups
- Nested groups are supported up to 3 levels deep
- Maximum nesting depth is enforced (cannot create 4th level)
- Logic tree view displays hierarchical condition structure
- Tree view shows operators at group nodes
- "Test Logic" button opens evaluation dialog
- Test Logic dialog shows current values and pass/fail status for each condition
- Groups persist to localStorage and reload correctly
- Ungroup function flattens conditions back to parent level
- Groups can be deleted with or without their conditions
- Auto-ungroup when group has only 1 condition remaining
- Existing ungrouped conditions continue to work (backward compatibility)
- View mode toggle persists user preference
- 20+ screenshots are taken documenting the test flow
