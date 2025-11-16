# ShopSage Design → Code Mapping

## Overview
This document maps design tokens and components from `/figma-sample` (Figma design reference) to the implementation in `/frontend` (Next.js application).

**Design Source**: `/figma-sample/src/styles/globals.css` + component library
**Implementation**: `/frontend` with Tailwind CSS + shadcn/ui components

---

## Color Palette Mapping

### Light Mode (Default)

| Figma Token | Value | Purpose | Tailwind Reference |
|-------------|-------|---------|-------------------|
| `--primary` | `#030213` | Primary color (navy/black) | Used for primary text, buttons, borders |
| `--primary-foreground` | `#ffffff` | Text on primary | White text on dark backgrounds |
| `--secondary` | `oklch(0.95 0.0058 264.53)` | Secondary color (very light blue-gray) | Used for secondary surfaces |
| `--secondary-foreground` | `#030213` | Text on secondary | Dark text on light backgrounds |
| `--accent` | `#e9ebef` | Accent/highlight color (light gray) | Used for accents, highlights |
| `--accent-foreground` | `#030213` | Text on accent | Dark text |
| `--background` | `#ffffff` | Page background | White background |
| `--foreground` | `oklch(0.145 0 0)` | Primary text color | Dark gray/black text |
| `--card` | `#ffffff` | Card background | White card surfaces |
| `--card-foreground` | `oklch(0.145 0 0)` | Text on cards | Dark text |
| `--muted` | `#ececf0` | Muted/disabled background | Light gray for disabled states |
| `--muted-foreground` | `#717182` | Muted text | Medium gray text |
| `--destructive` | `#d4183d` | Error/delete color | Red for errors and destructive actions |
| `--destructive-foreground` | `#ffffff` | Text on destructive | White text on red |
| `--border` | `rgba(0, 0, 0, 0.1)` | Border color | Light gray border |
| `--input` | `transparent` | Input border | Transparent (uses background) |
| `--input-background` | `#f3f3f5` | Input background | Light gray input field |
| `--ring` | `oklch(0.708 0 0)` | Focus ring color | Medium gray for focus rings |

### Dark Mode

| Figma Token | Value | Purpose | Tailwind Reference |
|-------------|-------|---------|-------------------|
| `--background` | `oklch(0.145 0 0)` | Dark page background | Dark gray background |
| `--foreground` | `oklch(0.985 0 0)` | Light text on dark | Near white text |
| `--primary` | `oklch(0.985 0 0)` | Primary on dark (light) | Light text/buttons |
| `--primary-foreground` | `oklch(0.205 0 0)` | Text on light primary | Dark text on light |
| `--secondary` | `oklch(0.269 0 0)` | Dark secondary | Dark surfaces |
| `--card` | `oklch(0.145 0 0)` | Dark card background | Dark cards |
| `--muted` | `oklch(0.269 0 0)` | Muted on dark | Very dark for disabled |
| `--muted-foreground` | `oklch(0.708 0 0)` | Muted text on dark | Light gray text |
| `--destructive` | `oklch(0.396 0.141 25.723)` | Dark red for errors | Darker red |
| `--destructive-foreground` | `oklch(0.637 0.237 25.331)` | Light red text | Lighter red text |
| `--border` | `oklch(0.269 0 0)` | Dark border | Dark gray border |

### Semantic Colors (Defined in Figma)

| Color | OKLCH Value | Usage |
|-------|------------|-------|
| **Blue** (Primary Action) | `oklch(.623 .214 259.815)` | Primary CTAs, links |
| **Green** (Success) | `oklch(.627 .194 149.214)` | Success messages, confirmed actions |
| **Red** (Error) | `oklch(.637 .237 25.331)` | Error states, validation errors |
| **Orange** (Warning) | `oklch(.646 .222 41.116)` | Warnings, caution messages |
| **Yellow** (Highlight) | `oklch(.852 .199 91.936)` | Highlights, important notices |
| **Purple** (Gradient) | `oklch(.558 .288 302.321)` | Gradient overlays, special elements |

### Chart Colors

| Chart Token | Light | Dark | Purpose |
|-------------|-------|------|---------|
| `--chart-1` | `oklch(0.646 0.222 41.116)` | `oklch(0.488 0.243 264.376)` | Primary chart color |
| `--chart-2` | `oklch(0.6 0.118 184.704)` | `oklch(0.696 0.17 162.48)` | Secondary chart color |
| `--chart-3` | `oklch(0.398 0.07 227.392)` | `oklch(0.769 0.188 70.08)` | Tertiary chart color |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | `oklch(0.627 0.265 303.9)` | Quaternary chart color |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | `oklch(0.645 0.246 16.439)` | Quinary chart color |

---

## Typography

### Font Family
- **Primary**: System UI sans-serif (Tailwind default)
- **Base Size**: 16px (`--font-size`)

### Heading Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| `h1` | `text-2xl` / 24px | Medium (500) | 1.5 (36px) |
| `h2` | `text-xl` / 20px | Medium (500) | 1.5 (30px) |
| `h3` | `text-lg` / 18px | Medium (500) | 1.5 (27px) |
| `h4` | `text-base` / 16px | Medium (500) | 1.5 (24px) |
| `p` | `text-base` / 16px | Normal (400) | 1.5 (24px) |
| `label` | `text-base` / 16px | Medium (500) | 1.5 (24px) |
| `button` | `text-base` / 16px | Medium (500) | 1.5 (24px) |
| `input` | `text-base` / 16px | Normal (400) | 1.5 (24px) |

### Font Weights
- **Normal**: 400 (`--font-weight-normal`)
- **Medium**: 500 (`--font-weight-medium`)

---

## Spacing & Sizing

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `0.375rem` / 6px | Small elements (icons, tight controls) |
| `--radius-md` | `0.500rem` / 8px | Medium elements (inputs, small cards) |
| `--radius-lg` | `0.625rem` / 10px | **Base radius** (cards, modals, buttons) |
| `--radius-xl` | `0.750rem` / 12px | Large elements, prominent cards |

**Tailwind Mapping**:
```tailwind
sm:  calc(var(--radius) - 4px)  = 6px
md:  calc(var(--radius) - 2px)  = 8px
lg:  var(--radius)              = 10px
xl:  calc(var(--radius) + 4px)  = 14px
```

### Spacing Scale
Uses Tailwind's default spacing scale (4px, 8px, 12px, 16px, 20px, 24px, 32px, etc.)

---

## Component Mapping

### Form & Input Components

| Figma Component | shadcn/ui | Status | Notes |
|-----------------|-----------|--------|-------|
| Input field | `input.tsx` | ✅ Exists | Light gray background (`#f3f3f5`), transparent border |
| Textarea | `textarea.tsx` | ✅ Exists | Multi-line input, consistent styling |
| Button | `button.tsx` | ✅ Exists | CVA variants: default, destructive, outline, secondary, ghost, link |
| Checkbox | (from Radix) | ⚠️ Partial | Needs styling update |
| Radio | (from Radix) | ⚠️ Partial | Needs styling update |
| Select | (from Radix) | ⚠️ Partial | Needs styling update |
| Toggle | (from Radix) | ⚠️ Partial | Needs styling update |
| Switch | (from Radix) | ⚠️ Partial | Background color `#cbced4` |
| Slider | (from Radix) | ⚠️ Partial | Needs styling update |
| Label | (custom) | ⚠️ Partial | Needs styling update |
| Calendar/Date Picker | (from Radix) | ⚠️ Partial | Needs styling update |

### Dialog & Modal Components

| Figma Component | shadcn/ui | Status | Notes |
|-----------------|-----------|--------|-------|
| Modal/Dialog | `dialog.tsx` (Radix) | ⚠️ Partial | Needs Figma styling |
| Alert Dialog | (from Radix) | ⚠️ Partial | Needs Figma styling |
| Popover | (from Radix) | ⚠️ Partial | Needs Figma styling |
| Tooltip | (from Radix) | ⚠️ Partial | Needs Figma styling |
| Toast/Notification | (from Radix) | ⚠️ Partial | Needs Figma styling |

### Data Display Components

| Figma Component | shadcn/ui | Status | Notes |
|-----------------|-----------|--------|-------|
| Card | `card.tsx` | ✅ Exists | White background, border, shadow |
| Badge | `badge.tsx` | ✅ Exists | Inline badge with variants |
| Alert | `alert.tsx` | ✅ Exists | Alert box with title and description |
| Table | (from Radix) | ⚠️ Partial | Needs responsive styling |
| Avatar | (from Radix) | ⚠️ Partial | Needs Figma styling |
| Skeleton | `skeleton.tsx` | ✅ Exists | Loading placeholder |
| Progress | (from Radix) | ⚠️ Partial | Needs Figma styling |
| Chart | Recharts wrapper | ⚠️ Partial | Uses chart colors, needs finalization |

### Layout & Navigation Components

| Figma Component | shadcn/ui | Status | Notes |
|-----------------|-----------|--------|-------|
| Navbar | Custom `navbar.tsx` | ✅ Exists | Fixed dark navbar, responsive |
| Sidebar | (from Radix) | ⚠️ Partial | Sidebar colors defined |
| Tabs | (from Radix) | ⚠️ Partial | Needs Figma styling |
| Breadcrumb | (from Radix) | ⚠️ Partial | If used in design |
| Accordion | (from Radix) | ⚠️ Partial | Needs Figma styling |
| Pagination | (from Radix) | ⚠️ Partial | Needs Figma styling |
| Separator | `separator.tsx` (Radix) | ✅ Exists | Divider primitive |

### Custom Domain Components

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| SearchPage | `SearchPage.tsx` | ✅ Exists | Chat interface, product results |
| TrackingPage | `TrackingPage.tsx` | ✅ Exists | Price tracking list view |
| ActiveTrackingPage | `ActiveTrackingPage.tsx` | ✅ Exists | Detailed price chart |
| ProfilePage | `ProfilePage.tsx` | ✅ Exists | User profile management |
| ProductResponseCard | `ProductResponseCard.tsx` | ✅ Exists | Product listing card |
| Navbar | `Navbar.tsx` | ✅ Exists | Navigation bar |

---

## Sidebar Colors (if used)

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | Sidebar background |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Sidebar text |
| `--sidebar-primary` | `#030213` | `oklch(0.488 0.243 264.376)` | Sidebar active/primary |
| `--sidebar-accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Sidebar accent |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(0.269 0 0)` | Sidebar border |

---

## Implementation Checklist

### ✅ Phase 1: Tokens & Config
- [ ] Merge Figma design tokens into `tailwind.config.ts`
- [ ] Update `app/globals.css` with Figma CSS variables
- [ ] Add Tailwind theme extensions for new colors
- [ ] Verify color tokens convert correctly (OKLCH → Tailwind)

### ⚠️ Phase 2: Component Styling
- [ ] Audit button variants (default, destructive, outline, secondary, ghost, link)
- [ ] Refactor input/textarea with light gray background
- [ ] Update card styling (border, shadow, padding)
- [ ] Update badge variants (default, primary, secondary, destructive, success, warning)
- [ ] Update alert styling (default, destructive, success, warning)
- [ ] Add missing form components (checkbox, radio, select, toggle, switch, slider, label, calendar)
- [ ] Add/refactor dialog components (modal, alert dialog, popover, tooltip, toast)
- [ ] Add/refactor data display (table, avatar, progress, chart)
- [ ] Add/refactor layout (sidebar, tabs, accordion, breadcrumb, pagination)
- [ ] Update navbar to use new color tokens
- [ ] Test all components in light and dark modes

### 📄 Phase 3: Pages & Layouts
- [ ] Update Search page layout and responsiveness
- [ ] Update Tracking pages (list and detail views)
- [ ] Update History page
- [ ] Update Settings page
- [ ] Implement responsive grid layouts (1-3 columns)
- [ ] Add loading and empty states

### 🎨 Phase 4: Responsive Design
- [ ] Test at 375px (mobile), 768px (tablet), 1024px (desktop), 1440px+ (ultrawide)
- [ ] Verify text sizes and line heights scale appropriately
- [ ] Check touch targets are ≥44px
- [ ] Test image responsiveness
- [ ] Verify form input sizes on mobile

### ♿ Phase 5: Accessibility
- [ ] Focus rings visible and match design (ring color)
- [ ] WCAG AA color contrast (4.5:1 for text)
- [ ] Proper heading hierarchy
- [ ] Form labels properly associated
- [ ] Modal focus trapping
- [ ] Keyboard navigation

### 🌙 Phase 6: Dark Mode
- [ ] Toggle dark mode in browser dev tools
- [ ] Verify all pages readable in dark mode
- [ ] Test color contrast in dark mode
- [ ] Verify images have sufficient contrast

---

## Divergences & Notes

### From Current Frontend to Figma Design
1. **Color palette**: Current frontend uses blue (#2563eb), green (#10b981), amber (#f59e0b). Figma introduces navy primary (#030213) and light gray accents.
2. **Typography**: Both use system UI sans-serif, but Figma emphasizes font weight 500 (medium) more consistently.
3. **Border radius**: Figma uses 10px base (`0.625rem`), current frontend uses 8px (`0.5rem`). Will be updated to 10px.
4. **Input styling**: Figma uses light gray background (#f3f3f5) with transparent border; current has gray-200 border.
5. **Spacing**: Both use Tailwind default spacing; no major changes needed.

### Retaining from Current Frontend
- ShopSage brand colors (orange, peach, etc.) remain available for secondary use
- Existing page routes and structure preserved
- Existing component hierarchy and composition patterns
- Tailwind utility-first approach maintained

### Future Enhancements (Not in Scope)
- WebSocket for real-time price updates
- Advanced data export (CSV, JSON)
- Price alert notifications
- Advanced filtering UI
- Internationalization (i18n)

---

## References

- **Figma Design**: `/figma-sample/src/styles/globals.css`
- **Current Frontend**: `/frontend/tailwind.config.ts`, `/frontend/app/globals.css`
- **shadcn/ui Docs**: https://ui.shadcn.com/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Radix UI Docs**: https://www.radix-ui.com/docs

---

**Last Updated**: 2025-11-15
**Status**: Design extraction complete; implementation in progress.
