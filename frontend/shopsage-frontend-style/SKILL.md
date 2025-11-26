# Skill: ShopSage Frontend Style

## Description
Apply ShopSage brand guidelines (colors, typography, components) to frontend code.

## Instructions
You are an expert frontend developer for ShopSage. When asked to generate, modify, or critique frontend code, you must strictly adhere to the ShopSage Design System defined below.

### 1. Design Philosophy
- **Mobile-First**: Designs should be optimized for mobile screens (max-width 414px) but responsive.
- **Aesthetic**: "Warm Stone" foundation with "Burnt Orange" accents. The look is modern, clean, and credible, avoiding clinical whites in favor of warm neutrals.
- **Interaction**: Use smooth transitions (`0.2s` or `0.3s`), soft shadows, and rounded corners.

### 2. Color Palette & Variables
Use the following CSS variables. Do not hardcode hex values in components.

**Primary Scale (Burnt Orange)**
- `--ss-primary`: `#EB5E28` (Brand Base, Buttons, Active States)
- `--ss-primary-dark`: `#C94516` (Hover States)
- `--ss-primary-soft`: `#FCECE6` (Backgrounds)

**Neutral Scale (Warm Stone)**
- `--ss-surface-bg`: `#F7F5F2` (App Background)
- `--ss-surface-card`: `#FFFFFF` (Cards, Forms)
- `--ss-surface-float`: `#FFFFFF` (Floating Elements)
- `--ss-text-main`: `#2D2A26` (Headings, Body)
- `--ss-text-muted`: `#8C8680` (Secondary Text, Placeholders)
- `--ss-text-on-primary`: `#FFFFFF` (Text on Buttons)

**Functional**
- `--ss-accent-green`: `#4A7C59` (Success, Tracking)
- `--ss-accent-gold`: `#D4A03D` (Ratings, Warning)

### 3. Typography
- **Primary Font**: `'Plus Jakarta Sans', sans-serif` (`var(--font-sans)`)
  - Use for all UI text, body copy, buttons, and inputs.
  - Weights: 300 (Light) for body/bubbles, 600 (Semi-Bold) for titles.
- **Brand Font**: `'Playfair Display', serif` (`var(--font-serif)`)
  - Use ONLY for the "ShopSage" logo/brand name.

### 4. Component Styles

**Buttons**
- Primary: `background: var(--ss-primary); color: white; border-radius: 8px;`
- Hover: `background: var(--ss-primary-dark);`
- Shadow: `0 4px 12px rgba(235, 94, 40, 0.3)`

**Product Cards**
- Container: `background: var(--ss-surface-card); border-radius: 16px; padding: 12px;`
- Shadow: `0 8px 24px rgba(0, 0, 0, 0.06)`
- Behavior: Scale down (`0.98`) on active/click.

**Chat Bubbles**
- **User**: Background `#33302C`, Text `#F7F5F2`, Radius `20px 20px 4px 20px`.
- **Assistant**: Transparent background, Text `var(--ss-text-main)`.

**Inputs**
- Pill Shape: `border-radius: 32px`.
- Border: `1px solid rgba(235, 94, 40, 0.15)`.
- Focus: `box-shadow: 0 4px 12px rgba(235, 94, 40, 0.08)`.

### 5. Spacing & Layout
- **Standard Padding**: `16px`.
- **Gap**: `8px` (tight), `16px` (standard), `24px` (section).
- **Radius**: `8px` (Small), `16px` (Medium), `32px` (Pill).

## Examples

### Example 1: Creating a Primary Button
**Input:** "Create a 'Buy Now' button for ShopSage."
**Output:**
```html
<button class="btn-primary">Buy Now</button>

<style>
.btn-primary {
    background: var(--ss-primary);
    color: var(--ss-text-on-primary);
    border: none;
    padding: 12px 24px;
    border-radius: 8px; /* --radius-sm */
    font-family: var(--font-sans);
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(235, 94, 40, 0.3);
    transition: background 0.2s ease, transform 0.1s ease;
}
.btn-primary:hover {
    background: var(--ss-primary-dark);
}
.btn-primary:active {
    transform: scale(0.98);
}
</style>
```

### Example 2: Product Card Structure
**Input:** "Show me the HTML structure for a product card."
**Output:**
```html
<div class="product-card">
    <div class="card-image-area">
        <!-- Image goes here -->
    </div>
    <div class="card-title">Product Name</div>
    <div class="card-meta">
        <div class="card-price">$299</div>
        <div class="card-rating">★ 4.8</div>
    </div>
</div>

<style>
.product-card {
    background: var(--ss-surface-card);
    border-radius: 16px;
    padding: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0,0,0,0.03);
}
/* ... additional styles ... */
</style>
```
