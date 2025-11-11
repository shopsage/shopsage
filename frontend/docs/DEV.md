# ShopSage Frontend (v0.2 — Mock-first, Adapter-based, UI Revamped)

## What is this?
A Next.js (TypeScript + Tailwind + shadcn/ui) frontend for ShopSage with Search (chat interface), Tracking (price charts), and Settings. It runs end-to-end in **mock mode** now and can swap to real APIs later by changing one env var.

**Version**: 0.2.0
**Status**: ✅ UI Revamped with shadcn/ui, Unified Conversation Model
**Last Updated**: November 11, 2025

## What's New in v0.2?

### UI Improvements
- **shadcn/ui Components**: Button, Card, Input, Badge, Skeleton, Textarea, and more
- **Color Palette Integration**: Full support for ShopSage brand colors from design docs
- **Responsive Layout**: Improved mobile support with hidden/shown sidebar logic
- **Chat Interface**: Cleaner message bubbles with support for response cards

### Navigation Changes
- **Simplified Navbar**: Now shows only **Search**, **Tracking**, and **Settings** (removed `/history`)
- **Conversation Sidebar**: Persistent left sidebar on `/search` showing conversation history
- **ChatGPT-style UX**: Create new chats, switch between conversations, organized history

### Unified Conversation Model
- **No Agent Distinction**: Removed "Product" vs "Supplier" toggle from UI
- **Auto Agent**: Backend defaults to `agent: "auto"` when creating conversations
- **Clean Interface**: Frontend no longer branches on conversation type
- **Backward Compatible**: Adapter still supports `product`/`supplier` for future use

## Run

### Prerequisites
- Node.js 18+ with pnpm

### Installation
```bash
cd frontend
pnpm install
```

### Development
```bash
# Mock mode (default, no backend required)
NEXT_PUBLIC_DATA_SOURCE=mock pnpm dev

# HTTP mode (with FastAPI backend on http://localhost:8000)
NEXT_PUBLIC_DATA_SOURCE=http pnpm dev
```

### Production Build
```bash
pnpm run build
pnpm run start
```

## Folder Structure
```
frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home redirect
│   ├── globals.css             # Tailwind + global styles
│   └── (shell)/                # Layout group for navbar pages
│       ├── layout.tsx          # Shell with navbar
│       ├── search/
│       │   ├── page.tsx        # Chat interface with sidebar
│       │   └── [conversationId]/page.tsx (TODO: individual conversation view)
│       ├── tracking/
│       │   ├── page.tsx        # Tracked items grid
│       │   └── [id]/page.tsx   # Price chart detail
│       └── settings/page.tsx   # User settings
├── components/
│   ├── navbar.tsx              # Navigation bar
│   └── ui/                     # shadcn UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       ├── skeleton.tsx
│       └── textarea.tsx
├── lib/
│   ├── utils.ts                # Helper functions (cn utility)
│   ├── types.ts                # TypeScript types
│   ├── adapters/
│   │   ├── client.ts           # ShopSageClient interface
│   │   ├── mock-client.ts      # In-memory mock implementation
│   │   ├── http-client.ts      # REST/SSE HTTP implementation
│   │   └── index.ts            # Factory (env-driven)
│   ├── stores/
│   │   ├── user.store.ts       # User state (Zustand)
│   │   ├── conversation.store.ts # Conversation state
│   │   └── tracking.store.ts   # Tracking state
│   └── mocks/data.ts           # Sample data for mock mode
├── docs/
│   ├── CONTEXT.md              # Product vision
│   ├── vibecoderjournal.md     # Development journal
│   └── *.png                   # Visual references
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts          # Theme with ShopSage colors
├── postcss.config.js
└── .eslintrc.json

```

## Adapter Contract (UI depends ONLY on this)

**Key Change**: `agent` is now optional and defaults to "auto"

```ts
export interface ShopSageClient {
  whoAmI(): Promise<User>;
  listConversations(): Promise<Conversation[]>;

  // ✅ Agent is now optional
  createConversation(agent?: AgentType): Promise<Conversation>;

  sendMessage(conversationId: string, content: string): Promise<void>;
  streamMessages(conversationId: string, onEvent: (m: Message) => void): () => void;
  search(query: string): Promise<Listing[]>;
  addTrackedItem(input: { sku?: string; modelName?: string; listingIds?: string[] }): Promise<TrackedItem>;
  listTrackedItems(): Promise<TrackedItem[]>;
  getPrices(trackedItemId: string, range: string): Promise<PricePoint[]>;
}
```

## Environment Variables

```env
# Data source: "mock" (default) or "http"
NEXT_PUBLIC_DATA_SOURCE=mock

# Backend API URL (only when NEXT_PUBLIC_DATA_SOURCE=http)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.4 + shadcn/ui
- **State**: Zustand (local UI) + React Query (server state, future)
- **Charts**: Recharts (price visualization)
- **HTTP**: Native `fetch` + SSE for streaming
- **Date**: date-fns
- **Icons**: Lucide React

## Development Patterns

### Adding a New Page
1. Create folder under `app/(shell)/`
2. Add `page.tsx` with `"use client"`
3. Use `getClient()` from adapters for data
4. Use Zustand stores for local state
5. Import shadcn components for UI

### Adding a UI Component
1. Create in `components/ui/`
2. Use shadcn pattern with CVA (class-variance-authority) for variants
3. Export both component and variants

### Styling Conventions
- Use Tailwind utilities directly
- Use shadcn components for form inputs, buttons, cards
- Custom spacing: `gap-4`, `p-4`, `mb-4` (consistent 16px baseline)
- Colors: Use `bg-primary-500`, `text-secondary`, `border-gray-200`

## Known Limitations & TODOs

### v0.2 TODOs
- [ ] Create `/search/[conversationId]/page.tsx` for individual conversation views
- [ ] Mobile menu hamburger toggle (Sheet component)
- [ ] Search filters and sorting on `/search`
- [ ] Error boundaries and toast notifications
- [ ] Loading skeletons on data-fetching pages
- [ ] Dark mode toggle (CSS variables ready)

### Future (v0.3+)
- [ ] Real HTTP integration with FastAPI
- [ ] Authentication (Auth.js or similar)
- [ ] Price alert notifications
- [ ] Export tracking data to CSV
- [ ] WebSocket support for real-time updates
- [ ] Advanced search with filters
- [ ] User preferences and saved searches

## Testing

```bash
# Build check
pnpm run build

# Linting
pnpm run lint

# Type check (included in lint)
```

## Notes for Next Developer

**Mock Data**: Edit `/lib/mocks/data.ts` to change sample conversations, products, or listings. Changes hot-reload.

**Adapter Pattern**: The adapter is the ONLY way UI accesses data. Never import `MockClient` or `HttpClient` directly in components.

**Color Palette**: See `/docs/Colour_Scheme.png` for brand colors. Tailwind config in `tailwind.config.ts` maps these.

**Conversation Model**: As of v0.2, conversations are unified. The `agent` field is optional; backend receives "auto" by default.

---

**ShopSage Frontend v0.2.0** — Built for Southeast Asian e-commerce with ❤️