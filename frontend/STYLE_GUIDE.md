# ShopSage Search Style Guide

This guide documents the design system and style guidelines. This serves as a reference for maintaining consistency across the ShopSage frontend.

## 1. Overview
The ShopSage Search interface is designed with a **mobile-first** philosophy, featuring a clean, modern aesthetic that balances warmth with credibility. The design uses a "Warm Stone" foundation with bold "Burnt Orange" accents to create an inviting yet professional atmosphere. Key interaction models include a conversational chat interface, horizontal scrolling product cards, and floating action elements.

## 2. Color Palette

### Primary Brand Scale (Burnt Orange)
The primary color defines the brand's bold, warm character. It is used for key actions and branding moments.

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `primary-50` | `#FDF6F3` | Subtle tints, hover backgrounds |
| `primary-100` | `#FCECE6` | **Soft Backgrounds** (`--ss-primary-soft`) |
| `primary-200` | `#F8D5C8` | Decorative borders |
| `primary-300` | `#F2B69E` | Secondary icons |
| `primary-400` | `#EE9270` | Focus rings |
| `primary-500` | `#EB5E28` | **Brand Base** (`--ss-primary`) |
| `primary-600` | `#C94516` | **Hover States** (`--ss-primary-dark`) |
| `primary-700` | `#9E3611` | Active states |
| `primary-800` | `#75280D` | Deep contrast |
| `primary-900` | `#4D1A08` | Darkest accents |

### Neutral Scale (Warm Stone)
A warm, organic neutral scale replacing clinical grays. This forms the "Warm Stone" foundation.

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `neutral-50` | `#FAF9F7` | Alternating rows |
| `neutral-100` | `#F7F5F2` | **App Background** (`--ss-surface-bg`) |
| `neutral-200` | `#E6E2DE` | **Outer Body** |
| `neutral-300` | `#D1CCC6` | Borders, Dividers |
| `neutral-400` | `#B0ABA5` | Disabled text |
| `neutral-500` | `#8C8680` | **Muted Text** (`--ss-text-muted`) |
| `neutral-600` | `#6B6661` | Secondary icons |
| `neutral-700` | `#4D4945` | Secondary text |
| `neutral-800` | `#2D2A26` | **Main Text** (`--ss-text-main`) |
| `neutral-900` | `#1A1816` | High contrast headings |

### Functional & Semantic Colors
Colors used to communicate status and feedback, tuned to harmonize with the warm palette.

| Role | Color Name | Hex | Background Pair | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | Credible Green | `#4A7C59` | `#E8F5E9` | Tracking badges, success toasts (`--ss-accent-green`) |
| **Warning** | Accent Gold | `#D4A03D` | `#FFF8E1` | Star ratings, alerts (`--ss-accent-gold`) |
| **Error** | Warm Red | `#D93025` | `#FCE8E6` | Form errors, destructive actions |
| **Info** | Slate Blue | `#4A6FA5` | `#EBF3FB` | Links, informational tags |

### Surface Aliases
Key background roles mapped to specific values.
- **Surface Card:** `#FFFFFF` (White) - *Crisp container for content (`--ss-surface-card`).*
- **Surface Float:** `#FFFFFF` (White) - *Elevated elements like the composer (`--ss-surface-float`).*
- **Surface BG:** `neutral-100` (`#F7F5F2`) - *Warm foundation for the app frame.*

### Gradients & Effects
- **Subtle Glow:** `radial-gradient(circle at 100% 0%, rgba(235, 94, 40, 0.08) 0%, transparent 25%)`
  - *Usage:* Top-right corner of the app frame to introduce brand warmth.
- **Organic Depth:** `radial-gradient(circle at 0% 100%, rgba(74, 124, 89, 0.05) 0%, transparent 30%)`
  - *Usage:* Bottom-left corner to balance with a hint of nature/green.

---

## 3. Typography

### Font Families
- **Sans-Serif (Primary):** `'Plus Jakarta Sans', sans-serif` (`var(--font-sans)`)
  - *Usage:* All UI text, body copy, buttons, inputs.
  - *Why:* Modern, geometric, and friendly with excellent legibility.
- **Serif (Brand):** `'Playfair Display', serif` (`var(--font-serif)`)
  - *Usage:* "ShopSage" logo/brand name.
  - *Why:* Adds a touch of elegance and editorial authority.

### Type Scale & Weights
| Element | Font Size | Weight | Line Height | Color |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Logo** | 22px | 600 (Semi-Bold) | - | Text Main |
| **Chat Bubble** | 15px | 300 (Light) | 1.6 | Text Main / Inverse |
| **Card Title** | 14px | 600 (Semi-Bold) | 1.3 | Text Main |
| **Card Price** | 16px | 700 (Bold) | - | Text Main |
| **Card Price (Old)**| 12px | 400 (Regular) | - | Text Muted |
| **Input Text** | 16px | 300 (Light) | - | Text Main |
| **Label/Badge** | 10-12px | 500-700 | - | Various |

### Unique Details
- **Light Weights:** The design heavily utilizes `font-weight: 300` for body text (chat bubbles, inputs) to create a refined, airy feel.
- **Letter Spacing:**
  - Brand Logo: `-0.02em` (Tighter)
  - Uppercase Labels: `0.05em` (Tracking)

---

## 4. Spacing & Layout

### Dimensions
- **Max Width:** `414px` (Mobile standard)
- **App Height:** `100vh` (Mobile) / `850px` (Desktop fixed)

### Spacing System
- **Base Unit:** 4px (Implicit)
- **Container Padding:** `16px` (Standard horizontal padding)
- **Section Gaps:** `24px` (Between chat turns)
- **Element Gaps:** `8px`, `12px`, `16px`

### Layout Patterns
- **Flexbox:** Heavily used for centering (`justify-content: center`, `align-items: center`) and row/column layouts.
- **Absolute Positioning:** Used for fixed UI elements like the Top Bar, Bottom Nav, and Floating Composer.
- **Safe Areas:** Bottom padding of `160px` in the chat scroll ensures content isn't hidden behind the floating composer.

---

## 5. Component Styles

### Chat Bubbles
- **User Bubble:**
  - Background: `#33302C`
  - Text: `#F7F5F2`
  - Radius: `20px 20px 4px 20px` (Top-Left, Top-Right, Bottom-Right, Bottom-Left) - *Note the "tail" effect on bottom-right.*
  - Shadow: `0 4px 12px rgba(45, 42, 38, 0.15)`
- **Assistant Bubble:**
  - Background: Transparent
  - Text: Text Main
  - Padding: 0
  - Avatar: 28x28px rounded square (8px radius) with primary background.

### Product Cards
- **Container:** White, `16px` radius, `12px` padding.
- **Shadow:** `0 8px 24px rgba(0, 0, 0, 0.06)`.
- **Interaction:** Scales down (`0.98`) on click.
- **Carousel:** Horizontal scroll with `scroll-snap-type: x mandatory`.

### Inputs & Forms
- **Composer Pill:** Floating white pill, `32px` radius, heavy shadow.
- **Price Input:** Pill shape, border `1px solid rgba(235, 94, 40, 0.15)`, internal button.
- **Preference Chips:**
  - Default: `#F0F0F0` bg, Muted text.
  - Selected: Primary bg, White text, shadow.

---

## 6. Shadow & Elevation
The design uses soft, diffused shadows to create depth without harsh outlines.

- **Level 1 (Subtle):** `0 2px 4px rgba(0, 0, 0, 0.02)` (Composer secondary)
- **Level 2 (Cards/Bubbles):** `0 4px 12px rgba(0,0,0,0.15)`
- **Level 3 (Floating):** `0 12px 32px rgba(0, 0, 0, 0.08)` (Composer main)
- **Level 4 (App Frame):** `0 40px 80px rgba(0, 0, 0, 0.15)`
- **Colored Shadows:** Used for brand elements (e.g., `0 4px 12px rgba(235, 94, 40, 0.3)` for primary buttons).

---

## 7. Animations & Transitions
- **Entry Animation:** `slideUpFade`
  - Duration: `0.6s`
  - Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`
  - Stagger: `0.1s` delay increments for sequential messages.
- **Hover Effects:**
  - Buttons/Cards: `transform: translateY(-1px)` or `scale(1.05)`.
  - Transitions: `0.2s` or `0.3s` ease.
- **Menu Icon:** Bars expand on hover (`transition: width 0.3s ease`).

---

## 8. Border Radius
- **Small (`--radius-sm`):** `8px` (Buttons, Avatars, Chips)
- **Medium (`--radius-md`):** `16px` (Cards, Forms)
- **Large (`--radius-lg`):** `24px` (Not heavily used in snippet, likely for larger containers)
- **Pill:** `30px` - `32px` (Inputs, Composer)
- **App Frame:** `40px` (Desktop view)

---

## 9. Opacity & Transparency
- **Glassmorphism:** Used in Top Bar and Bottom Nav.
  - Background: `rgba(255, 255, 255, 0.85)` or `rgba(247, 245, 242, 0.9)`
  - Filter: `backdrop-filter: blur(10px)` to `blur(20px)`
- **Placeholders:** `opacity: 0.7`
- **Badges:** `rgba(255, 255, 255, 0.9)`

---

## 10. Tailwind CSS Usage (Note)
The project currently uses **Vanilla CSS** (custom properties and classes). However, here are the equivalent Tailwind utility patterns observed:

- **Colors:** `text-[#2D2A26]`, `bg-[#EB5E28]`, `bg-[#F7F5F2]`
- **Typography:** `font-['Lexend_Deca']`, `font-light` (300), `font-semibold` (600)
- **Shadows:** `shadow-lg`, `shadow-[0_8px_24px_rgba(0,0,0,0.06)]`
- **Radius:** `rounded-2xl` (16px), `rounded-full`
- **Flex:** `flex`, `items-center`, `justify-between`, `gap-4`
- **Blur:** `backdrop-blur-md`

---

## 11. Example Component Reference
**Product Card Component**

```html
<div class="product-card">
    <!-- Badge -->
    <div class="card-badge">Best Deal</div>
    
    <!-- Image Area -->
    <div class="card-image-area">
        <div class="img-headphones"></div>
    </div>
    
    <!-- Content -->
    <div class="card-title">Sony WH-1000XM5 Wireless Noise Cancelling</div>
    <div class="card-meta">
        <div>
            <div class="card-price">$319 <span>$379</span></div>
            <div class="card-rating">
                <span class="star">★</span> 4.9 (2.1k)
            </div>
        </div>
        <span class="platform-text">Shopee</span>
    </div>
</div>
```

**CSS Reference:**
```css
.product-card {
    background: var(--ss-surface-card);
    border-radius: var(--radius-md); /* 16px */
    padding: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.03);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.product-card:active {
    transform: scale(0.98);
}
```
