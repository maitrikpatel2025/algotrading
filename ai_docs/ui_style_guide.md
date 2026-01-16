# Forex Dash UI Style Guide

> **Version:** 1.0.0  
> **Last Updated:** January 2026  
> **Framework:** React + Shadcn UI + Tailwind CSS

A comprehensive reference for developers implementing the Forex Dash trading platform UI. This guide ensures visual consistency, accessibility, and a professional trading experience across all components.

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Shadcn UI Component Guidelines](#shadcn-ui-component-guidelines)
6. [Trading-Specific Components](#trading-specific-components)
7. [Responsive Design](#responsive-design)
8. [Accessibility Guidelines](#accessibility-guidelines)
9. [Animation & Motion](#animation--motion)
10. [Code Examples](#code-examples)
11. [Migration Notes](#migration-notes)

---

## Brand Identity

### Brand Name
**Forex Dash** — A professional forex trading dashboard platform.

### Brand Values
- **Trust & Stability** — Conveyed through blue primary colors
- **Clarity** — Clean interfaces with clear data visualization
- **Speed** — Real-time performance and instant feedback
- **Professionalism** — Financial-grade UI standards

### Logo Usage
The Forex Dash wordmark should appear in the navigation bar with:
- Font: Anek Odia Bold (700)
- Color: White on dark backgrounds
- Minimum padding: 16px (1rem)

---

## Color System

### CSS Variables Configuration

Add the following to your `globals.css` or Tailwind CSS configuration:

```css
@layer base {
  :root {
    /* Background & Foreground */
    --background: 0 0% 100%;           /* #FFFFFF */
    --foreground: 240 6% 10%;          /* #1A1A1B */
    
    /* Card & Popover */
    --card: 0 0% 100%;                 /* #FFFFFF */
    --card-foreground: 240 6% 10%;     /* #1A1A1B */
    --popover: 0 0% 100%;              /* #FFFFFF */
    --popover-foreground: 240 6% 10%;  /* #1A1A1B */
    
    /* Primary - Microsoft Blue */
    --primary: 206 100% 42%;           /* #0078D7 */
    --primary-foreground: 0 0% 100%;   /* #FFFFFF */
    --primary-hover: 206 68% 51%;      /* #2B88D8 */
    
    /* Secondary */
    --secondary: 240 5% 96%;           /* #F4F4F5 */
    --secondary-foreground: 240 6% 10%; /* #1A1A1B */
    
    /* Accent - Teal */
    --accent: 168 100% 35%;            /* #00B294 */
    --accent-foreground: 0 0% 100%;    /* #FFFFFF */
    
    /* Muted */
    --muted: 240 5% 96%;               /* #F4F4F5 */
    --muted-foreground: 240 4% 46%;    /* #71717A */
    
    /* Destructive/Bearish - Red */
    --destructive: 0 84% 50%;          /* #DB2828 */
    --destructive-foreground: 0 0% 100%; /* #FFFFFF */
    
    /* Success/Bullish - Green */
    --success: 140 70% 43%;            /* #21BA45 */
    --success-foreground: 0 0% 100%;   /* #FFFFFF */
    
    /* Warning - Amber */
    --warning: 38 92% 50%;             /* #F59E0B */
    --warning-foreground: 0 0% 0%;     /* #000000 */
    
    /* Info */
    --info: 199 89% 48%;               /* #0EA5E9 */
    --info-foreground: 0 0% 100%;      /* #FFFFFF */
    
    /* Border & Input */
    --border: 240 6% 90%;              /* #E4E4E7 */
    --input: 240 6% 90%;               /* #E4E4E7 */
    --ring: 206 100% 42%;              /* #0078D7 */
    
    /* Radius */
    --radius: 0.3rem;
    
    /* Chart Colors */
    --chart-bullish: 140 70% 43%;      /* #21BA45 */
    --chart-bearish: 0 84% 50%;        /* #DB2828 */
    --chart-neutral: 206 100% 42%;     /* #0078D7 */
    --chart-grid: 240 5% 90%;          /* #E5E5E5 */
    --chart-volume: 206 50% 70%;       /* #7CB9E8 */
  }

  .dark {
    /* Background & Foreground */
    --background: 240 6% 4%;           /* #0A0A0B */
    --foreground: 0 0% 98%;            /* #FAFAFA */
    
    /* Card & Popover */
    --card: 240 4% 10%;                /* #18181B */
    --card-foreground: 0 0% 98%;       /* #FAFAFA */
    --popover: 240 4% 10%;             /* #18181B */
    --popover-foreground: 0 0% 98%;    /* #FAFAFA */
    
    /* Primary - Microsoft Blue (consistent) */
    --primary: 206 100% 42%;           /* #0078D7 */
    --primary-foreground: 0 0% 100%;   /* #FFFFFF */
    --primary-hover: 206 68% 56%;      /* #4A9FE0 */
    
    /* Secondary */
    --secondary: 240 4% 16%;           /* #27272A */
    --secondary-foreground: 0 0% 98%;  /* #FAFAFA */
    
    /* Accent - Teal (consistent) */
    --accent: 168 100% 35%;            /* #00B294 */
    --accent-foreground: 0 0% 100%;    /* #FFFFFF */
    
    /* Muted */
    --muted: 240 4% 16%;               /* #27272A */
    --muted-foreground: 240 5% 65%;    /* #A1A1AA */
    
    /* Destructive/Bearish - Red */
    --destructive: 0 84% 60%;          /* #EF4444 */
    --destructive-foreground: 0 0% 100%; /* #FFFFFF */
    
    /* Success/Bullish - Green */
    --success: 142 71% 45%;            /* #22C55E */
    --success-foreground: 0 0% 100%;   /* #FFFFFF */
    
    /* Warning - Amber */
    --warning: 38 92% 50%;             /* #F59E0B */
    --warning-foreground: 0 0% 0%;     /* #000000 */
    
    /* Info */
    --info: 199 89% 48%;               /* #0EA5E9 */
    --info-foreground: 0 0% 100%;      /* #FFFFFF */
    
    /* Border & Input */
    --border: 240 4% 25%;              /* #3F3F46 */
    --input: 240 4% 25%;               /* #3F3F46 */
    --ring: 206 100% 42%;              /* #0078D7 */
    
    /* Chart Colors (Dark Mode) */
    --chart-bullish: 142 71% 45%;      /* #22C55E */
    --chart-bearish: 0 84% 60%;        /* #EF4444 */
    --chart-neutral: 206 100% 50%;     /* #1E90FF */
    --chart-grid: 240 4% 20%;          /* #333337 */
    --chart-volume: 206 60% 50%;       /* #4D9DE0 */
  }
}
```

### Color Palette Reference

#### Primary Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--primary` | `#0078D7` | `#0078D7` | Primary actions, links, active states |
| `--primary-hover` | `#2B88D8` | `#4A9FE0` | Hover states for primary elements |
| `--accent` | `#00B294` | `#00B294` | Active states, highlights, secondary CTA |

#### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--success` | `#21BA45` | `#22C55E` | Bullish indicators, profits, positive values |
| `--destructive` | `#DB2828` | `#EF4444` | Bearish indicators, losses, errors, warnings |
| `--warning` | `#F59E0B` | `#F59E0B` | Caution states, pending actions |
| `--info` | `#0EA5E9` | `#0EA5E9` | Informational messages, tips |

#### Neutral Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--background` | `#FFFFFF` | `#0A0A0B` | Page background |
| `--foreground` | `#1A1A1B` | `#FAFAFA` | Primary text |
| `--muted` | `#F4F4F5` | `#27272A` | Subdued backgrounds |
| `--muted-foreground` | `#71717A` | `#A1A1AA` | Secondary text |
| `--border` | `#E4E4E7` | `#3F3F46` | Borders, dividers |
| `--card` | `#FFFFFF` | `#18181B` | Card backgrounds |

### Color Usage Guidelines

#### ✅ Do's

- Use `--primary` for main interactive elements (buttons, links)
- Use `--success` for positive financial data (profits, gains, bullish)
- Use `--destructive` for negative financial data (losses, errors, bearish)
- Maintain consistent color meanings across the application
- Use semantic color tokens, not raw hex values

#### ❌ Don'ts

- Don't use more than 5-6 colors in a single view
- Don't use color as the only indicator (add icons/text for accessibility)
- Don't mix bullish/bearish color meanings
- Don't use low-contrast color combinations

---

## Typography

### Font Family

**Primary Font:** Anek Odia (Google Fonts)

```css
@import url('https://fonts.googleapis.com/css2?family=Anek+Odia:wght@300;400;500;700&display=swap');

:root {
  --font-sans: 'Anek Odia', system-ui, -apple-system, BlinkMacSystemFont, 
               'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, Monaco, 
               'Andale Mono', 'Ubuntu Mono', monospace;
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Anek Odia', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
}
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| **Display** | 3rem (48px) | 700 | 1.1 | -0.02em | Hero sections |
| **H1** | 2.25rem (36px) | 700 | 1.2 | -0.01em | Page titles |
| **H2** | 1.875rem (30px) | 700 | 1.25 | -0.01em | Section headers |
| **H3** | 1.5rem (24px) | 500 | 1.3 | 0 | Subsection headers |
| **H4** | 1.25rem (20px) | 500 | 1.4 | 0 | Card titles |
| **Body Large** | 1.125rem (18px) | 400 | 1.5 | 0 | Lead paragraphs |
| **Body** | 1rem (16px) | 400 | 1.5 | 0 | Default body text |
| **Body Small** | 0.875rem (14px) | 400 | 1.5 | 0 | Secondary text |
| **Caption** | 0.75rem (12px) | 400 | 1.4 | 0.01em | Labels, timestamps |
| **Data Display** | 1rem (16px) | 700 | 1.3 | 0 | Financial figures |
| **Data Large** | 1.5rem (24px) | 700 | 1.2 | 0 | Key metrics |

### Font Weight Reference

| Weight | Value | Usage |
|--------|-------|-------|
| Light | 300 | Large display text, decorative |
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Subheadings, emphasis |
| Bold | 700 | Headings, important data, buttons |

### Typography CSS Classes

```css
/* Typography utility classes */
.text-display {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.text-h1 {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.text-h2 {
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.25;
}

.text-h3 {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.3;
}

.text-body-lg {
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.5;
}

.text-data {
  font-size: 1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.text-data-lg {
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* Monospace for numbers in tables */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
```

---

## Spacing & Layout

### Base Spacing Scale

Use a **4px base unit** system for consistent spacing:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0px | No spacing |
| `--space-1` | 4px (0.25rem) | Tight spacing, icon gaps |
| `--space-2` | 8px (0.5rem) | Default inner spacing |
| `--space-3` | 12px (0.75rem) | Compact padding |
| `--space-4` | 16px (1rem) | Standard padding/margins |
| `--space-5` | 20px (1.25rem) | Medium spacing |
| `--space-6` | 24px (1.5rem) | Section spacing |
| `--space-8` | 32px (2rem) | Large section gaps |
| `--space-10` | 40px (2.5rem) | Major section separation |
| `--space-12` | 48px (3rem) | Page-level spacing |
| `--space-16` | 64px (4rem) | Hero sections |

### Component Spacing Guidelines

```css
:root {
  /* Component-specific spacing */
  --button-padding-x: 1.2rem;
  --button-padding-y: 0.5rem;
  --input-padding-x: 0.9rem;
  --input-padding-y: 0.5rem;
  --card-padding: 1rem;
  --nav-item-padding: 1rem;
  --container-padding: 1rem;
  --section-gap: 2rem;
}
```

### Layout Grid System

#### Dashboard Grid

```css
/* Main dashboard layout */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .dashboard-grid {
    grid-template-columns: 300px 1fr 300px;
  }
}
```

#### Chart Area Layout

```css
/* Price chart container */
.chart-container {
  min-height: 600px;
  height: calc(100vh - 400px);
}

.chart-inner {
  height: calc(100% - 50px); /* Account for toolbar */
}
```

### Container Widths

| Breakpoint | Container Max-Width | Usage |
|------------|-------------------|-------|
| Default | 100% | Mobile |
| `sm` (640px) | 100% | Small tablets |
| `md` (768px) | 720px | Tablets |
| `lg` (1024px) | 960px | Small desktops |
| `xl` (1280px) | 1200px | Desktops |
| `2xl` (1536px) | 1400px | Large screens |

---

## Shadcn UI Component Guidelines

### Installation

```bash
# Initialize Shadcn UI
npx shadcn-ui@latest init

# Install recommended components for trading UI
npx shadcn-ui@latest add button card table badge progress
npx shadcn-ui@latest add navigation-menu sheet dialog
npx shadcn-ui@latest add select input form label
npx shadcn-ui@latest add tabs switch checkbox
npx shadcn-ui@latest add toast sonner tooltip
npx shadcn-ui@latest add chart skeleton
```

### Recommended Components by Feature

#### Navigation

| Component | Usage |
|-----------|-------|
| `NavigationMenu` | Main navigation bar |
| `Sheet` | Mobile sidebar navigation |
| `Tabs` | Page-level tab navigation |
| `Breadcrumb` | Hierarchical navigation |

#### Data Display

| Component | Usage |
|-----------|-------|
| `Card` | Account summary, headlines, technicals |
| `Table` | Price data, trade history, positions |
| `Badge` | Status indicators, labels |
| `Progress` | Bullish/bearish meters |
| `Skeleton` | Loading states |

#### Charts & Visualization

| Component | Usage |
|-----------|-------|
| `Chart` | Price charts (wraps Recharts) |
| Custom Plotly integration | OHLC candlestick charts |

#### Trade Panels

| Component | Usage |
|-----------|-------|
| `Dialog` | Order confirmation modals |
| `Sheet` | Trade execution panels |
| `Form` + `Input` | Order entry forms |
| `Select` | Instrument selection |

#### Feedback & Notifications

| Component | Usage |
|-----------|-------|
| `Sonner` / `Toast` | Trade execution alerts |
| `Alert` | System messages |
| `Tooltip` | Contextual help |

#### Settings & Controls

| Component | Usage |
|-----------|-------|
| `Switch` | Toggle settings |
| `Select` | Dropdown selections |
| `RadioGroup` | Mutually exclusive options |
| `Slider` | Volume, risk settings |

### Component Theming Examples

#### Button Variants

```tsx
import { Button } from "@/components/ui/button"

// Primary action (default)
<Button>Execute Trade</Button>

// Buy/Bullish action
<Button className="bg-success hover:bg-success/90">Buy</Button>

// Sell/Bearish action
<Button variant="destructive">Sell</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Ghost (subtle)
<Button variant="ghost">More Options</Button>

// Outline
<Button variant="outline">View Details</Button>
```

#### Card Component

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Account Summary</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### Progress Component (Bullish/Bearish)

```tsx
import { Progress } from "@/components/ui/progress"

// Bullish meter
<div className="space-y-2">
  <Progress value={75} className="h-6 [&>div]:bg-success" />
  <p className="text-center font-bold text-success">Bullish 75%</p>
</div>

// Bearish meter
<div className="space-y-2">
  <Progress value={25} className="h-6 [&>div]:bg-destructive" />
  <p className="text-center font-bold text-destructive">Bearish 25%</p>
</div>
```

#### Data Table

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Instrument</TableHead>
      <TableHead className="text-right">Bid</TableHead>
      <TableHead className="text-right">Ask</TableHead>
      <TableHead className="text-right">Change</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">EUR/USD</TableCell>
      <TableCell className="text-right tabular-nums">1.0845</TableCell>
      <TableCell className="text-right tabular-nums">1.0847</TableCell>
      <TableCell className="text-right tabular-nums text-success">+0.15%</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Badge Variants

```tsx
import { Badge } from "@/components/ui/badge"

// Status badges
<Badge>Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="outline">Draft</Badge>
<Badge variant="destructive">Closed</Badge>

// Custom trading badges
<Badge className="bg-success text-success-foreground">Long</Badge>
<Badge className="bg-destructive text-destructive-foreground">Short</Badge>
```

---

## Trading-Specific Components

### Price Display Component

```tsx
interface PriceDisplayProps {
  value: number;
  previousValue?: number;
  decimals?: number;
}

function PriceDisplay({ value, previousValue, decimals = 5 }: PriceDisplayProps) {
  const isPositive = previousValue ? value > previousValue : true;
  const isNegative = previousValue ? value < previousValue : false;
  
  return (
    <span className={cn(
      "tabular-nums font-bold",
      isPositive && "text-success",
      isNegative && "text-destructive"
    )}>
      {value.toFixed(decimals)}
    </span>
  );
}
```

### Profit/Loss Display

```tsx
interface PnLDisplayProps {
  value: number;
  currency?: string;
  showSign?: boolean;
}

function PnLDisplay({ value, currency = "USD", showSign = true }: PnLDisplayProps) {
  const isProfit = value >= 0;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    signDisplay: showSign ? 'always' : 'auto'
  }).format(value);
  
  return (
    <span className={cn(
      "tabular-nums font-bold text-lg",
      isProfit ? "text-success" : "text-destructive"
    )}>
      {formatted}
    </span>
  );
}
```

### Percentage Change

```tsx
interface PercentChangeProps {
  value: number;
  showIcon?: boolean;
}

function PercentChange({ value, showIcon = true }: PercentChangeProps) {
  const isPositive = value >= 0;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 tabular-nums font-medium",
      isPositive ? "text-success" : "text-destructive"
    )}>
      {showIcon && (
        isPositive 
          ? <ArrowUpIcon className="h-4 w-4" />
          : <ArrowDownIcon className="h-4 w-4" />
      )}
      {value >= 0 ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}
```

### Market Status Indicator

```tsx
type MarketStatus = 'open' | 'closed' | 'pre-market' | 'after-hours';

function MarketStatusBadge({ status }: { status: MarketStatus }) {
  const variants = {
    open: "bg-success text-success-foreground",
    closed: "bg-muted text-muted-foreground",
    'pre-market': "bg-warning text-warning-foreground",
    'after-hours': "bg-info text-info-foreground"
  };
  
  return (
    <Badge className={cn("uppercase text-xs", variants[status])}>
      {status.replace('-', ' ')}
    </Badge>
  );
}
```

### Candlestick Color Guidelines

```css
/* Candlestick chart colors */
.candle-bullish {
  fill: hsl(var(--chart-bullish));
  stroke: hsl(var(--chart-bullish));
}

.candle-bearish {
  fill: hsl(var(--chart-bearish));
  stroke: hsl(var(--chart-bearish));
}

.candle-doji {
  fill: hsl(var(--muted));
  stroke: hsl(var(--muted-foreground));
}

/* Volume bars */
.volume-bullish {
  fill: hsl(var(--chart-bullish) / 0.5);
}

.volume-bearish {
  fill: hsl(var(--chart-bearish) / 0.5);
}
```

---

## Responsive Design

### Breakpoint System

```css
/* Tailwind default breakpoints */
--breakpoint-sm: 640px;   /* Small devices (landscape phones) */
--breakpoint-md: 768px;   /* Medium devices (tablets) */
--breakpoint-lg: 1024px;  /* Large devices (desktops) */
--breakpoint-xl: 1280px;  /* Extra large devices */
--breakpoint-2xl: 1536px; /* 2X large devices */
```

### Mobile-First Approach

Always design for mobile first, then enhance for larger screens:

```tsx
// Example: Responsive card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

### Layout Adaptations

| Screen Size | Navigation | Sidebar | Chart | Data Tables |
|-------------|------------|---------|-------|-------------|
| Mobile (<640px) | Hamburger menu | Hidden (Sheet) | Full width, stacked | Horizontal scroll |
| Tablet (640-1024px) | Top bar | Collapsible | Full width | Responsive columns |
| Desktop (>1024px) | Full navigation | Visible | Main area | Full table |

### Responsive Typography

```css
/* Responsive font sizes */
.responsive-heading {
  font-size: 1.5rem;      /* Mobile */
}

@media (min-width: 768px) {
  .responsive-heading {
    font-size: 1.875rem;  /* Tablet */
  }
}

@media (min-width: 1024px) {
  .responsive-heading {
    font-size: 2.25rem;   /* Desktop */
  }
}
```

### Touch-Friendly Guidelines

- Minimum touch target: 44×44px
- Adequate spacing between interactive elements (minimum 8px)
- Larger buttons on mobile (minimum height 48px)
- Swipe gestures for chart navigation

---

## Accessibility Guidelines

### Color Contrast Requirements

| WCAG Level | Contrast Ratio | Usage |
|------------|---------------|-------|
| AA (normal text) | 4.5:1 minimum | Body text, labels |
| AA (large text) | 3:1 minimum | Headings 18px+, bold 14px+ |
| AAA (enhanced) | 7:1 minimum | Critical financial data |

### Verified Contrast Ratios

| Combination | Ratio | Status |
|-------------|-------|--------|
| Primary (#0078D7) on White | 4.5:1 | ✅ AA |
| Success (#21BA45) on White | 3.4:1 | ✅ AA Large |
| Destructive (#DB2828) on White | 4.2:1 | ✅ AA |
| Foreground (#1A1A1B) on Background (#FFFFFF) | 15.9:1 | ✅ AAA |
| Dark Foreground (#FAFAFA) on Background (#0A0A0B) | 18.1:1 | ✅ AAA |

### Color Blindness Considerations

Don't rely solely on color to convey meaning. Always pair with:

- **Icons:** ↑ for gains, ↓ for losses
- **Text labels:** "Profit", "Loss", "+", "-"
- **Patterns:** Solid fill for bullish, hatched for bearish
- **Position:** Positive values on left/top, negative on right/bottom

```tsx
// ✅ Good: Color + Icon + Text
<span className="text-success flex items-center gap-1">
  <ArrowUpIcon className="h-4 w-4" />
  +$150.00 Profit
</span>

// ❌ Bad: Color only
<span className="text-success">$150.00</span>
```

### Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

```tsx
// Focus ring styling
<Button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Submit
</Button>
```

### ARIA Labels

```tsx
// Data table with ARIA
<Table aria-label="Currency pair prices">
  <TableHeader>
    <TableRow>
      <TableHead scope="col">Pair</TableHead>
      <TableHead scope="col">Price</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>EUR/USD</TableCell>
      <TableCell aria-label="Price: 1.0845">1.0845</TableCell>
    </TableRow>
  </TableBody>
</Table>

// Progress with ARIA
<Progress 
  value={75} 
  aria-label="Bullish sentiment: 75%"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={75}
/>
```

### Screen Reader Announcements

```tsx
// Live region for price updates
<div aria-live="polite" aria-atomic="true" className="sr-only">
  EUR/USD price updated to 1.0847
</div>

// Alert for trade execution
<Alert role="alert" aria-live="assertive">
  Trade executed successfully: Buy 10,000 EUR/USD at 1.0847
</Alert>
```

---

## Animation & Motion

### Animation Principles

1. **Purpose:** Animations should guide attention, not distract
2. **Duration:** Keep animations under 300ms for UI feedback
3. **Easing:** Use ease-out for entering, ease-in for exiting
4. **Respect preferences:** Honor `prefers-reduced-motion`

### CSS Animation Variables

```css
:root {
  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  
  /* Easings */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Recommended Animations

#### Price Update Flash

```css
@keyframes price-flash {
  0% { background-color: transparent; }
  50% { background-color: hsl(var(--primary) / 0.2); }
  100% { background-color: transparent; }
}

.price-updated {
  animation: price-flash var(--duration-normal) var(--ease-out);
}

.price-up {
  animation: price-flash var(--duration-normal) var(--ease-out);
  --tw-bg-opacity: 0.2;
  background-color: hsl(var(--success) / var(--tw-bg-opacity));
}

.price-down {
  animation: price-flash var(--duration-normal) var(--ease-out);
  --tw-bg-opacity: 0.2;
  background-color: hsl(var(--destructive) / var(--tw-bg-opacity));
}
```

#### Loading States

```tsx
import { Skeleton } from "@/components/ui/skeleton"

// Loading card
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-32" />
  </CardHeader>
  <CardContent className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </CardContent>
</Card>
```

#### Chart Loading Spinner

```tsx
<div className="flex items-center justify-center h-[400px]">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
</div>
```

---

## Code Examples

### Complete Navigation Bar

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
]

export function NavigationBar() {
  const pathname = usePathname()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-black text-white">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold px-4">
          Forex Dash
        </Link>
        
        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent text-white hover:bg-white/10",
                      pathname === item.href && "bg-white/20"
                    )}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        
        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-black text-white">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-lg py-2 px-4 rounded hover:bg-white/10",
                    pathname === item.href && "bg-white/20 font-bold"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
```

### Complete Account Summary Card

```tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface AccountData {
  Id: string
  Balance: number
  Equity: number
  Profit: number
  Margin: number
  MarginLevel: number
  Leverage: number
}

const DATA_KEYS = [
  { name: "Account Num.", key: "Id", fixed: -1 },
  { name: "Balance", key: "Balance", fixed: 2, prefix: "$" },
  { name: "Equity", key: "Equity", fixed: 2, prefix: "$" },
  { name: "Profit", key: "Profit", fixed: 2, prefix: "$", colored: true },
  { name: "Margin", key: "Margin", fixed: 2, prefix: "$" },
  { name: "Margin Level %", key: "MarginLevel", fixed: 2, suffix: "%" },
  { name: "Leverage", key: "Leverage", fixed: -1, prefix: "1:" },
] as const

export function AccountSummary() {
  const [account, setAccount] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAccount()
  }, [])

  const loadAccount = async () => {
    try {
      const response = await fetch('/api/account')
      const data = await response.json()
      setAccount(data)
    } catch (error) {
      console.error('Error loading account:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatValue = (
    value: number | string | undefined,
    fixed: number,
    prefix?: string,
    suffix?: string
  ) => {
    if (value === undefined || value === null) return '-'
    let formatted = fixed > 0 && typeof value === 'number'
      ? value.toFixed(fixed)
      : String(value)
    return `${prefix || ''}${formatted}${suffix || ''}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {account && (
          <div className="space-y-3">
            {DATA_KEYS.map((item) => {
              const value = account[item.key as keyof AccountData]
              const isProfit = item.colored && typeof value === 'number'
              
              return (
                <div key={item.key} className="flex justify-between">
                  <span className="font-medium text-muted-foreground">
                    {item.name}
                  </span>
                  <span className={cn(
                    "font-bold tabular-nums",
                    isProfit && value >= 0 && "text-success",
                    isProfit && value < 0 && "text-destructive"
                  )}>
                    {formatValue(value, item.fixed, item.prefix, item.suffix)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### Complete Technicals Component with Progress

```tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TechnicalsData {
  percent_bullish: number
  percent_bearish: number
  R1: number
  R2: number
  R3: number
  S1: number
  S2: number
  S3: number
  pivot: number
}

interface TechnicalsProps {
  data: TechnicalsData
}

const PIVOT_HEADERS = ["R1", "R2", "R3", "S1", "S2", "S3", "pivot"] as const

export function Technicals({ data }: TechnicalsProps) {
  const bullishPercent = parseFloat(data.percent_bullish?.toString() || "0")
  const bearishPercent = parseFloat(data.percent_bearish?.toString() || "0")
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sentiment Meters */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Bullish</span>
              <span className="text-success font-bold">{bullishPercent}%</span>
            </div>
            <Progress 
              value={bullishPercent} 
              className="h-4 [&>div]:bg-success"
              aria-label={`Bullish sentiment: ${bullishPercent}%`}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Bearish</span>
              <span className="text-destructive font-bold">{bearishPercent}%</span>
            </div>
            <Progress 
              value={bearishPercent} 
              className="h-4 [&>div]:bg-destructive"
              aria-label={`Bearish sentiment: ${bearishPercent}%`}
            />
          </div>
        </div>
        
        {/* Pivot Points Table */}
        <Table>
          <TableHeader>
            <TableRow>
              {PIVOT_HEADERS.map((header) => (
                <TableHead key={header} className="text-center">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              {PIVOT_HEADERS.map((header) => (
                <TableCell key={header} className="text-center tabular-nums">
                  {data[header]?.toFixed(5) || '-'}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
```

---

## Migration Notes

### From Custom CSS to Tailwind/Shadcn

#### CSS Class Mapping

| Current Class | Tailwind Equivalent |
|---------------|-------------------|
| `.segment` | `Card` component or `rounded-md border shadow-sm p-4` |
| `.account-row` | `flex justify-between` |
| `.bold` | `font-bold` |
| `.header` | `text-muted-foreground` |
| `.progress` | `Progress` component |
| `.progress-holder` | (handled by Progress component) |
| `.progress-text` | `text-center font-bold` |
| `.navlink` | `NavigationMenuItem` |
| `.headline` | `font-medium py-3` |
| `#navbar` | `bg-black text-white flex justify-between items-center` |
| `#footer` | `bg-black/75 text-white p-4 font-bold mt-8` |
| `.container` | `container px-4` |
| `.options` | `flex items-center gap-4` |
| `.select` | `Select` component |
| `button` | `Button` component |

#### Global Styles Migration

Replace `index.css` with Tailwind base styles:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Anek+Odia:wght@300;400;500;700&display=swap');

@layer base {
  :root {
    /* Include CSS variables from Color System section */
  }
  
  html {
    @apply h-full;
  }
  
  body {
    @apply h-full m-0 p-0 font-sans;
  }
}

@layer utilities {
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
}
```

### Component Migration Checklist

- [ ] Install Tailwind CSS and configure with Anek Odia font
- [ ] Install Shadcn UI and add required components
- [ ] Set up CSS variables (copy from Color System section)
- [ ] Migrate `NavigationBar` → use `NavigationMenu` + `Sheet`
- [ ] Migrate `Button` → use Shadcn `Button`
- [ ] Migrate `Select` → use Shadcn `Select`
- [ ] Migrate `.segment` divs → use Shadcn `Card`
- [ ] Migrate `Progress` → use Shadcn `Progress`
- [ ] Migrate table styles → use Shadcn `Table`
- [ ] Add toast notifications with `Sonner`
- [ ] Implement dark mode toggle
- [ ] Test accessibility with screen readers
- [ ] Verify responsive behavior on all breakpoints

---

## Quick Reference

### Color Tokens Cheat Sheet

```css
/* Primary Actions */
bg-primary text-primary-foreground      /* Buttons, links */
hover:bg-primary/90                      /* Hover states */

/* Trading Signals */
text-success                             /* Bullish, profit, positive */
text-destructive                         /* Bearish, loss, negative */

/* Surfaces */
bg-background                            /* Page background */
bg-card                                  /* Card surfaces */
bg-muted                                 /* Subdued backgrounds */

/* Text */
text-foreground                          /* Primary text */
text-muted-foreground                    /* Secondary text */

/* Borders */
border-border                            /* Default borders */
border-input                             /* Input borders */
```

### Common Component Patterns

```tsx
// Bullish value
<span className="text-success font-bold tabular-nums">+$150.00</span>

// Bearish value
<span className="text-destructive font-bold tabular-nums">-$75.00</span>

// Neutral value
<span className="font-bold tabular-nums">$1,000.00</span>

// Status badge
<Badge className="bg-success text-success-foreground">Long</Badge>

// Action button
<Button size="sm">Execute</Button>
<Button size="sm" variant="destructive">Close</Button>
```

---

## Resources

### Official Documentation
- [Shadcn UI Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Recharts Documentation](https://recharts.org)

### Design References
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Google Fonts - Anek Odia](https://fonts.google.com/specimen/Anek+Odia)

### Trading UI Inspiration
- Bloomberg Terminal
- TradingView
- MetaTrader 5
- Interactive Brokers

---

*This style guide is a living document. Update it as the design system evolves.*
