# ShopSage Frontend PRD

## 1. Overview
ShopSage is an AI-powered shopping assistant for Southeast Asia designed to help users research products, compare listings, and track price changes across multiple e-commerce platforms. The interface is conversational, mobile-first, and built for high engagement.

## 2. Technology Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **UI Library:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React (standard for shadcn) or custom SVGs as needed
- **State Management:** React Context or Zustand (TBD based on complexity)
- **Fonts:** Plus Jakarta Sans (Primary), Playfair Display (Brand/Serif)

## 3. Design System & Aesthetics
Refers to `frontend/STYLE_GUIDE.md`.
- **Theme:** "Warm Stone" foundation with "Burnt Orange" accents.
- **Typography:** Modern, geometric sans-serif for UI; Elegant serif for brand moments.
- **Visuals:** Glassmorphism, soft shadows, rounded corners (mobile-friendly).
- **Responsiveness:** Mobile-first design, scaling up to a fixed-width desktop view (app frame).

## 4. Core Features

### 4.1. Search (Product Discovery)
**Goal:** Help users find the right product through conversation.
- **Interface:** Chat-based UI (User & Assistant bubbles).
- **Key Interactions:**
  - **Natural Language Input:** Users type queries (e.g., "noise cancelling headphones").
  - **Guided Filtering:** Assistant proposes chips/filters (e.g., "Type: Over-ear", "Budget: Under $350").
  - **Product Results:** Horizontal carousel of product cards.
  - **Product Details:** Clicking a card opens a detailed view or redirects (per flow).
- **Components:**
  - `ChatContainer`: Scrollable area for messages.
  - `MessageBubble`: Variants for User (Dark) and Assistant (Transparent).
  - `Composer`: Floating input bar with attachment and send buttons.
  - `ProductCard`: Displays image, title, price, rating, and platform.
  - `FilterChips`: Selectable options for refining search.

### 4.2. Tracking (Price Watch)
**Goal:** Allow users to monitor specific products for price drops.
- **Interface:** List view of tracked items.
- **Key Interactions:**
  - **Add to Track:** Users can add products from Search results to their tracking list.
  - **Manual Entry:** Users can input a specific product model/URL to track.
  - **Dashboard:** View all tracked items with current price and trend indicators.
  - **Notifications:** (Future) Alerts when prices drop.
- **Components:**
  - `TrackingList`: Vertical list of tracked items.
  - `TrackingCard`: Summary of product status (Current Price, Target Price, Trend).
  - `AddProductModal`: Input for adding new items manually.

## 5. User Flows

### 5.1. Product Discovery Flow
1.  **Start:** User lands on Search page.
2.  **Query:** User enters a prompt or selects a suggestion.
3.  **Refinement:** ShopSage asks clarifying questions (if needed) via chips/text.
4.  **Results:** ShopSage presents product options.
5.  **Action:** User clicks "Buy Now" (redirect) or "Track" (add to tracking).

### 5.2. Product Tracking Flow
1.  **Input:** User identifies a specific product (via Search or direct input).
2.  **Identification:** ShopSage extracts SKU/Model.
3.  **Confirmation:** ShopSage confirms the product identity.
4.  **Tracking:** Product is added to the user's tracking list.
5.  **Monitoring:** System tracks daily prices (backend process).

## 6. Component Architecture (shadcn/ui Mapping)
We will leverage shadcn/ui components and customize them to match the ShopSage brand.

| Feature | ShopSage Component | shadcn/ui Base | Customization Needed |
| :--- | :--- | :--- | :--- |
| **Layout** | `AppFrame` | - | Custom container with max-width and background styles. |
| **Navigation** | `BottomNav` | `NavigationMenu` (or custom) | Glassmorphism, active states, icons. |
| **Chat** | `Composer` | `Input`, `Button` | Floating pill shape, shadow effects. |
| **Chat** | `Avatar` | `Avatar` | Brand colors, square-rounded shape. |
| **Cards** | `ProductCard` | `Card` | Custom layout for image, badges, and price. |
| **Tracking** | `TrackingCard` | `Card` | Status indicators, trend arrows. |
| **Inputs** | `FilterChip` | `Badge` / `Toggle` | Selectable states, brand colors. |
| **Feedback** | `Toast` | `Toast` | Success/Error notifications. |
| **Dialogs** | `Modal` | `Dialog` | For confirming actions or detailed views. |

## 7. File Structure (Proposed)
```
app/
  layout.tsx       # Root layout (fonts, global styles)
  page.tsx         # Redirect to /search or Landing
  search/
    page.tsx       # Search Interface
    components/    # Search-specific components
  tracking/
    page.tsx       # Tracking Dashboard
    components/    # Tracking-specific components
components/
  ui/              # shadcn/ui components
  shared/          # Reusable app components (Nav, Header)
lib/
  utils.ts         # Helpers
styles/
  globals.css      # Tailwind directives & CSS variables
```

## 8. Next Steps
1.  Initialize Next.js project.
2.  Configure Tailwind with ShopSage colors/fonts.
3.  Install shadcn/ui and add base components.
4.  Implement `AppFrame` and `BottomNav`.
5.  Build `Search` page with mock data.
6.  Build `Tracking` page with mock data.
