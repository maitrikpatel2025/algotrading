# E2E Test: Frontend Redesign Validation

Test the redesigned frontend following the Precision Swiss design system.

## User Story

As a trader
I want a clean, professional, Swiss-design-inspired trading interface
So that I can focus on data without visual distractions

## Test Steps

### Phase 1: Design System Validation

1. Navigate to the `Application URL` (redirects to Strategy Library)
2. Take a screenshot of the initial state
3. **Verify** the page uses light background (neutral-50/white, no dark gradients)
4. **Verify** navigation bar has white/light background with 1px bottom border (no gradients)
5. **Verify** Inter font is loaded (check computed font-family)

### Phase 2: Navigation Bar

6. **Verify** navigation links are visible: Strategies, Monitor, Account
7. **Verify** active link has primary blue (#2563EB) color
8. **Verify** logo and brand name are visible
9. Take a screenshot of navigation bar

### Phase 3: Strategy Library Page

10. **Verify** page title uses heading-1 styling (24px, semibold)
11. **Verify** "New Strategy" button has primary styling (#2563EB background)
12. **Verify** strategy list items have proper card styling (1px border, no shadow)
13. **Verify** action buttons follow secondary button pattern
14. Take a screenshot of Strategy Library

### Phase 4: Monitor Page

15. Click on "Monitor" in the navigation
16. **Verify** Monitor page loads without gradient hero section
17. **Verify** Bot status card has left-border status indicator
18. **Verify** status badge uses proper colors (green-50 bg for running, etc.)
19. **Verify** KPI numbers use tabular-nums font variant
20. Take a screenshot of Monitor page

### Phase 5: Account Page

21. Click on "Account" in the navigation
22. **Verify** Account page loads with clean styling
23. **Verify** Account summary displays with KPI card pattern
24. **Verify** tables have proper header styling (neutral-100 bg, uppercase)
25. **Verify** P&L values use profit/loss colors (#16A34A / #DC2626)
26. Take a screenshot of Account page

### Phase 6: Strategy Builder Page

27. Navigate to `/strategies/new`
28. **Verify** Strategy Builder loads with clean toolbar
29. **Verify** pair selector has proper input styling (44px height, border)
30. **Verify** timeframe buttons have toggle styling
31. **Verify** chart container has proper border styling
32. **Verify** Logic panel has clean card styling
33. Take a screenshot of Strategy Builder

### Phase 7: Component Consistency

34. **Verify** all buttons follow design system (6px radius, proper padding)
35. **Verify** all inputs have consistent focus states (blue ring)
36. **Verify** typography hierarchy is consistent across pages
37. Take final comparison screenshot

## Success Criteria

- All pages use light background (no dark theme by default)
- No gradient backgrounds visible on navigation or hero sections
- Primary blue (#2563EB) used only for CTAs and active states
- All financial numbers display with tabular-nums
- Cards have 1px border styling (no shadows on default cards)
- Tables have uppercase header labels with neutral-100 background
- Status badges follow color specifications
- Inter font is applied throughout
- 7 screenshots are taken documenting the redesigned UI
