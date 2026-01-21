# Design System Specification: Precision Swiss

> **Version:** 2.0.0  
> **Last Updated:** January 2026  
> **Framework:** React + Tailwind CSS  
> **Philosophy:** Swiss Design / International Typographic Style

A design system characterized by mathematical precision, typography-driven hierarchy, and ruthless clarity. Every pixel serves a purpose - this is Swiss precision applied to trading.

---

## Table of Contents

1. [Core Visual Language](#core-visual-language)
2. [Color Palette](#color-palette)
3. [Typography System](#typography-system)
4. [Spacing System](#spacing-system)
5. [Component Specifications](#component-specifications)
6. [Layout Principles](#layout-principles)
7. [Animation Guidelines](#animation-guidelines)
8. [Implementation Rules](#implementation-rules)
9. [Visual Hierarchy System](#visual-hierarchy-system)
10. [Iconography System](#iconography-system)
11. [Dark Mode Adaptation](#dark-mode-adaptation)
12. [Trading-Specific Patterns](#trading-specific-patterns)
13. [Quick Reference](#quick-reference)

---

## Core Visual Language

This design system emphasizes:

- **Grid Mathematics** — Every element aligns to an 8px grid
- **Typographic Hierarchy** — Typography drives visual organization
- **Generous Whitespace** — Let data breathe
- **Functional Minimalism** — No decoration, only function

Every element should reinforce trust and data clarity - critical for financial trading applications.

---

## Color Palette

### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#2563EB` | Primary CTAs, active states, links |
| `primary-hover` | `#1D4ED8` | Hover state for primary elements |
| `primary-light` | `#EFF6FF` | Subtle backgrounds, selected states |

### Neutral Scale

| Token | Hex | Usage |
|-------|-----|-------|
| `neutral-50` | `#FAFAFA` | Page backgrounds |
| `neutral-100` | `#F5F5F5` | Card backgrounds, zebra stripes |
| `neutral-200` | `#E5E5E5` | Borders, dividers |
| `neutral-300` | `#D4D4D4` | Disabled borders |
| `neutral-400` | `#A3A3A3` | Placeholder text, icons |
| `neutral-500` | `#737373` | Secondary text, labels |
| `neutral-600` | `#525252` | Body text |
| `neutral-700` | `#404040` | Headings |
| `neutral-800` | `#262626` | High emphasis text |
| `neutral-900` | `#171717` | Maximum contrast, primary headings |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#16A34A` (Green-600) | Positive states, confirmations |
| `success-light` | `#DCFCE7` | Success backgrounds |
| `warning` | `#CA8A04` (Yellow-600) | Caution states |
| `warning-light` | `#FEF9C3` | Warning backgrounds |
| `error` | `#DC2626` (Red-600) | Error states, destructive |
| `error-light` | `#FEE2E2` | Error backgrounds |
| `info` | `#2563EB` (Blue-600) | Informational states |

### Trading-Specific Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `profit` | `#16A34A` | Positive P&L, buy signals |
| `loss` | `#DC2626` | Negative P&L, sell signals |
| `neutral-trade` | `#737373` | Pending, neutral states |

### Special Effects

```css
/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
```

### CSS Variables Configuration

```css
@layer base {
  :root {
    /* Primary */
    --primary: #2563EB;
    --primary-hover: #1D4ED8;
    --primary-light: #EFF6FF;
    
    /* Neutral Scale */
    --neutral-50: #FAFAFA;
    --neutral-100: #F5F5F5;
    --neutral-200: #E5E5E5;
    --neutral-300: #D4D4D4;
    --neutral-400: #A3A3A3;
    --neutral-500: #737373;
    --neutral-600: #525252;
    --neutral-700: #404040;
    --neutral-800: #262626;
    --neutral-900: #171717;
    
    /* Semantic */
    --success: #16A34A;
    --success-light: #DCFCE7;
    --warning: #CA8A04;
    --warning-light: #FEF9C3;
    --error: #DC2626;
    --error-light: #FEE2E2;
    --info: #2563EB;
    
    /* Trading */
    --profit: #16A34A;
    --loss: #DC2626;
    --neutral-trade: #737373;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }
}
```

---

## Typography System

### Font Stack

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 0.75rem (12px) | 1rem | Timestamps, micro labels |
| `text-sm` | 0.875rem (14px) | 1.25rem | Table data, secondary info |
| `text-base` | 1rem (16px) | 1.5rem | Body text, form inputs |
| `text-lg` | 1.125rem (18px) | 1.75rem | Card titles |
| `text-xl` | 1.25rem (20px) | 1.75rem | Section headers |
| `text-2xl` | 1.5rem (24px) | 2rem | Page titles |
| `text-3xl` | 1.875rem (30px) | 2.25rem | Dashboard KPIs |
| `text-4xl` | 2.25rem (36px) | 2.5rem | Hero numbers |
| `text-5xl` | 3rem (48px) | 1.2 | Large display numbers |

### Font Weights

| Element | Weight | Usage |
|---------|--------|-------|
| Headings | 600 (semibold) | All heading levels |
| Body | 400 (regular) | Paragraph text |
| UI elements | 500 (medium) | Buttons, labels |
| Emphasis/Numbers | 600 (semibold) | Important data |
| Data tables | 400 labels, 500 values | Table content |

### Numeric Typography (Critical for Trading)

```css
/* Always use for financial figures */
font-variant-numeric: tabular-nums;
letter-spacing: -0.01em;
```

### Typography CSS Classes

```css
/* Primary headings */
.heading-1 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 2rem;
  color: var(--neutral-900);
}

.heading-2 {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.75rem;
  color: var(--neutral-800);
}

/* Body text */
.body {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5rem;
  color: var(--neutral-600);
}

.body-sm {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.25rem;
  color: var(--neutral-500);
}

/* Labels */
.label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--neutral-500);
}

/* Financial figures */
.financial {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.kpi-number {
  font-size: 2.25rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
```

---

## Spacing System

Base unit: **8px (0.5rem)**

### Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0 | No spacing |
| `space-1` | 4px (0.25rem) | Tight gaps |
| `space-2` | 8px (0.5rem) | Icon gaps, tight padding |
| `space-3` | 12px (0.75rem) | Compact spacing |
| `space-4` | 16px (1rem) | Default padding |
| `space-5` | 20px (1.25rem) | Medium spacing |
| `space-6` | 24px (1.5rem) | Card padding |
| `space-8` | 32px (2rem) | Section gaps |
| `space-10` | 40px (2.5rem) | Large gaps |
| `space-12` | 48px (3rem) | Section padding |
| `space-16` | 64px (4rem) | Major sections |
| `space-20` | 80px (5rem) | Hero sections |

---

## Component Specifications

### Buttons

#### Primary Button

```css
.btn-primary {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  text-transform: none;
  background: #2563EB;
  color: #FFFFFF;
  border: none;
  transition: background-color 150ms ease-out, transform 100ms ease-out;
  box-shadow: none;
}

.btn-primary:hover {
  background: #1D4ED8;
}

.btn-primary:active {
  transform: scale(0.98);
}
```

#### Secondary Button

```css
.btn-secondary {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  background: transparent;
  border: 1px solid #E5E5E5;
  color: #404040;
  transition: background-color 150ms ease-out, border-color 150ms ease-out;
}

.btn-secondary:hover {
  background: #F5F5F5;
  border-color: #D4D4D4;
}
```

#### Danger Button

```css
.btn-danger {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  background: #DC2626;
  color: #FFFFFF;
  border: none;
}

.btn-danger:hover {
  background: #B91C1C;
}
```

### Input Fields

```css
.input {
  height: 44px;
  padding: 0 16px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  background: #FFFFFF;
  font-size: 14px;
  transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
}

.input:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-error {
  border-color: #DC2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}
```

### Cards

```css
.card {
  padding: 24px;
  border-radius: 8px;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  box-shadow: none;
}

/* Card with elevation (floating panels) */
.card-elevated {
  padding: 24px;
  border-radius: 8px;
  background: #FFFFFF;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  border: none;
}
```

### Data Tables

```css
/* Table Container */
.table-container {
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  overflow: hidden;
}

/* Header Row */
.table-header {
  background: #F5F5F5;
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #737373;
  padding: 12px 16px;
}

/* Body Row */
.table-row {
  padding: 16px;
  border-bottom: 1px solid #F5F5F5;
}

.table-row:hover {
  background: #FAFAFA;
}

/* Zebra striping (optional) */
.table-row:nth-child(even) {
  background: #FAFAFA;
}
```

### Bot Status Cards

```css
/* Running */
.bot-card-running {
  border-left: 3px solid #16A34A;
}

/* Stopped */
.bot-card-stopped {
  border-left: 3px solid #737373;
}

/* Error */
.bot-card-error {
  border-left: 3px solid #DC2626;
}
```

### Trading Charts

```css
/* Chart container */
.chart-container {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 16px;
}

/* Candlestick colors */
:root {
  --candle-up: #16A34A;
  --candle-down: #DC2626;
  --candle-wick: #404040;
}

/* Grid lines */
.chart-grid {
  stroke: #F5F5F5;
  stroke-width: 1px;
}

/* Axis labels */
.chart-axis-label {
  font-size: 11px;
  fill: #737373;
}
```

### Indicator Sidebar (Draggable Items)

```css
.indicator-item {
  padding: 12px 16px;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  cursor: grab;
  transition: box-shadow 150ms ease-out, transform 150ms ease-out;
}

.indicator-item:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.indicator-item.dragging {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  transform: rotate(2deg);
  opacity: 0.9;
}
```

---

## Layout Principles

### Grid System

| Property | Value |
|----------|-------|
| Container max-width | 1440px |
| Grid columns | 12 |
| Grid gap | 24px |
| Section padding | 48px 0 |

### Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile | 640px | Small screens |
| Tablet | 768px | Medium screens |
| Desktop | 1024px | Standard desktops |
| Large | 1280px | Wide screens |

---

## Animation Guidelines

### Timing Functions

```css
/* Ease out for entering elements */
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);

/* Ease in-out for continuous animations */
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
```

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `instant` | 0ms | No animation |
| `fast` | 150ms | Hovers, focus |
| `normal` | 200ms | Standard transitions |
| `slow` | 300ms | Complex animations |

### Standard Transitions

```css
/* Hover states */
transition: background-color 150ms ease-out;

/* Focus states */
transition: box-shadow 150ms ease-out;

/* Active states */
transition: transform 100ms ease-out;
```

---

## Implementation Rules

### DO

- Use the 8px grid religiously - all spacing should be multiples of 8
- Use `tabular-nums` for all financial figures for perfect alignment
- Keep decorative elements to absolute zero - let data breathe
- Use color sparingly - grayscale + one accent
- Maintain consistent vertical rhythm throughout
- Use uppercase + letter-spacing for small labels

### DON'T

- Never use gradients or decorative backgrounds
- Never use more than 2 font weights per component
- Never use rounded corners larger than 8px
- Never use colored backgrounds for cards (white only)
- Never add shadows to inline elements

### Accessibility Requirements

| Requirement | Specification |
|-------------|---------------|
| Minimum text contrast | 4.5:1 |
| UI element contrast | 3:1 |
| Focus indicators | 3px blue ring with offset |
| Touch targets | Minimum 44px |
| Motion preferences | Respect `prefers-reduced-motion` |

---

## Visual Hierarchy System

### Emphasis Levels

| Level | Specs | Usage |
|-------|-------|-------|
| Level 1 (Maximum) | text-2xl, font-weight-600, neutral-900 | Page titles |
| Level 2 (High) | text-lg, font-weight-600, neutral-800 | Section headers |
| Level 3 (Standard) | text-base, font-weight-400, neutral-600 | Body text |
| Level 4 (Reduced) | text-sm, font-weight-400, neutral-500 | Secondary info |
| Level 5 (Minimum) | text-xs, font-weight-400, neutral-400 | Timestamps, hints |

---

## Iconography System

### Icon Style

| Property | Value |
|----------|-------|
| Weight | 1.5px stroke |
| Corner radius | Rounded |
| Grid size (default) | 20px |
| Grid size (small) | 16px |
| Grid size (large) | 24px |
| Style | Outlined |
| Recommended library | Lucide icons |

---

## Dark Mode Adaptation

### Color Transformations

| Element | Dark Mode Value |
|---------|-----------------|
| Background | `#171717` (neutral-900) |
| Surface | `#262626` (neutral-800) |
| Border | `#404040` (neutral-700) |
| Text primary | `#FAFAFA` (neutral-50) |
| Text secondary | `#A3A3A3` (neutral-400) |
| Primary | `#2563EB` (unchanged) |

### CSS Variables (Dark Mode)

```css
.dark {
  --background: #171717;
  --surface: #262626;
  --border: #404040;
  --text-primary: #FAFAFA;
  --text-secondary: #A3A3A3;
  --primary: #2563EB;
}
```

---

## Trading-Specific Patterns

### P&L Display

```css
/* Positive P&L */
.pnl-positive {
  color: #16A34A;
}
.pnl-positive::before {
  content: '+';
}

/* Negative P&L */
.pnl-negative {
  color: #DC2626;
}

/* Neutral P&L */
.pnl-neutral {
  color: #737373;
}
```

### Status Badges

```css
/* Running status */
.badge-running {
  background: #DCFCE7;
  color: #166534;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* Stopped status */
.badge-stopped {
  background: #F5F5F5;
  color: #525252;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* Error status */
.badge-error {
  background: #FEE2E2;
  color: #991B1B;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
```

### KPI Cards

```css
/* Large number display */
.kpi-value {
  font-size: 36px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

/* KPI label */
.kpi-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #737373;
  margin-bottom: 4px;
}
```

---

## Quick Reference

### Implementation Checklist

1. Start with semantic HTML and proper heading hierarchy
2. Apply 8px spacing grid
3. Use Inter font with proper weights
4. Add single accent color for CTAs only
5. Test with real trading data for alignment
6. Verify all numbers use `tabular-nums`

### Tailwind Utility Mapping

```tsx
// Primary button
<button className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-md transition-colors">
  Execute Trade
</button>

// Secondary button
<button className="px-6 py-3 bg-transparent border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#404040] text-sm font-medium rounded-md transition-colors">
  Cancel
</button>

// Input field
<input className="h-11 px-4 border border-[#E5E5E5] rounded-md text-sm focus:outline-none focus:border-[#2563EB] focus:ring-[3px] focus:ring-[#2563EB]/10" />

// Card
<div className="p-6 bg-white border border-[#E5E5E5] rounded-lg">
  {/* content */}
</div>

// Financial figure (positive)
<span className="text-[#16A34A] font-semibold tabular-nums">+$1,234.56</span>

// Financial figure (negative)
<span className="text-[#DC2626] font-semibold tabular-nums">-$567.89</span>

// Table header
<th className="bg-[#F5F5F5] px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#737373]">
  Column
</th>

// Status badge (running)
<span className="px-2 py-1 bg-[#DCFCE7] text-[#166534] text-xs font-medium rounded">
  Running
</span>

// KPI display
<div className="space-y-1">
  <p className="text-xs uppercase tracking-wider text-[#737373]">Total Profit</p>
  <p className="text-4xl font-semibold tabular-nums tracking-tight">$12,345.67</p>
</div>
```

### Color Quick Reference

```css
/* Backgrounds */
bg-[#FAFAFA]    /* Page background */
bg-[#FFFFFF]    /* Card background */
bg-[#F5F5F5]    /* Muted background */

/* Text */
text-[#171717]  /* Primary heading */
text-[#404040]  /* Secondary heading */
text-[#525252]  /* Body text */
text-[#737373]  /* Muted text */
text-[#A3A3A3]  /* Placeholder */

/* Borders */
border-[#E5E5E5]  /* Default border */
border-[#D4D4D4]  /* Hover border */

/* Primary */
bg-[#2563EB]      /* Primary button */
hover:bg-[#1D4ED8] /* Primary hover */

/* Trading */
text-[#16A34A]    /* Profit/bullish */
text-[#DC2626]    /* Loss/bearish */
```

---

## Resources

### Official Documentation
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Inter Font](https://rsms.me/inter/)
- [Lucide Icons](https://lucide.dev)

### Design References
- Swiss Design / International Typographic Style
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

*Remember: Every pixel should serve a purpose. This is Swiss precision applied to trading - no decoration, only function.*
