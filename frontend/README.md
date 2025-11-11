# ShopSage Frontend

A modern, mock-first Next.js frontend for ShopSage — AI-powered shopping research and price tracking for Southeast Asian e-commerce.

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm (installed via npm)
- Frontend is at `/Users/mchao/Docs/Acad/SUTD/Capstone/Code/shopsage/frontend`

### Installation

```bash
# From the frontend directory
pnpm install
```

### Run in Mock Mode (Default)

```bash
# Mock mode uses in-memory data + localStorage (no backend required)
NEXT_PUBLIC_DATA_SOURCE=mock pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Run with HTTP Backend

```bash
# Make sure FastAPI backend is running on http://localhost:8000
NEXT_PUBLIC_DATA_SOURCE=http pnpm dev
```

See `.env.example` for all environment variables.

## Features

### 🔍 Search Page (`/search`)
- Chat-like interface for product and supplier research
- Toggle between "Product Research" and "Supplier Research" agents
- Real-time streaming responses from the agent
- Response cards with product recommendations and supplier listings
- Create, manage, and switch between conversations

### 📊 Tracking Page (`/tracking`)
- View all actively tracked products
- Switch between "Active Tracking" and "Saved Products" tabs
- Quick glance at current price, lowest/highest prices, and price trends
- Click any item to view detailed 90-day price chart

### 📈 Tracking Detail (`/tracking/[id]`)
- Interactive 90-day price chart (powered by Recharts)
- Current, lowest, and highest prices
- Price change percentage
- List of tracked listings (expandable)
- Price trend visualization

### ⏱️ History Page (`/history`)
- View all past research conversations
- Filter by agent type (Product, Supplier, or All)
- Quick access to previous research sessions
- Timestamps and message counts

### ⚙️ Settings Page (`/settings`)
- View and copy your guest user ID (stored in localStorage)
- Check current data source mode
- (Future) notification preferences, theme selection

## Architecture

### Adapter Pattern
All UI code uses the `ShopSageClient` interface. This means:
- **UI doesn't care about the backend** — it calls the adapter
- **Mock mode** = in-memory data stored in the adapter
- **HTTP mode** = real API calls to FastAPI backend
- **Switch modes** by changing one environment variable

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom component classes
- **State Management**: Zustand (stores) + React Query (server state)
- **Charts**: Recharts (price visualizations)
- **HTTP**: Native `fetch` API + SSE for streaming
- **Date Handling**: date-fns

### Folder Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home (redirect to /search)
│   ├── globals.css              # Tailwind + global styles
│   └── (shell)/                 # Route group for pages with navbar
│       ├── layout.tsx           # Shell layout with navbar + user init
│       ├── search/              # /search page
│       ├── tracking/            # /tracking and /tracking/[id]
│       ├── history/             # /history page
│       └── settings/            # /settings page
│
├── components/                   # Reusable React components
│   └── navbar.tsx               # Navigation bar
│
├── lib/
│   ├── types.ts                 # Shared TypeScript types
│   ├── adapters/
│   │   ├── client.ts            # ShopSageClient interface
│   │   ├── mock-client.ts       # Mock implementation
│   │   ├── http-client.ts       # HTTP implementation (stubs)
│   │   └── index.ts             # Factory function
│   ├── mocks/
│   │   └── data.ts              # Sample data
│   ├── stores/
│   │   ├── user.store.ts        # User state (Zustand)
│   │   ├── conversation.store.ts # Conversation state
│   │   └── tracking.store.ts    # Tracking state
│   └── constants.ts             # Magic strings, defaults
│
├── package.json                  # Dependencies
├── tsconfig.json                # TypeScript config
├── next.config.js               # Next.js config
├── tailwind.config.ts           # Tailwind config
├── .eslintrc.json               # ESLint config
├── .env.example                 # Environment template
└── .gitignore
```

## Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# Data source: "mock" (default) or "http"
NEXT_PUBLIC_DATA_SOURCE=mock

# Backend API URL (only when NEXT_PUBLIC_DATA_SOURCE=http)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Building for Production

```bash
pnpm run build      # Build optimized bundle
pnpm run start      # Start production server
pnpm run lint       # Run ESLint
```

## Mock Data

The app ships with realistic mock data in `/lib/mocks/data.ts`:
- **Users**: One guest user with UUID in localStorage
- **Conversations**: Sample product and supplier research conversations
- **Listings**: Realistic e-commerce listings (Shopee, Lazada, Tokopedia)
- **Tracked Items**: Sample tracked products with 90-day price history
- **Price Data**: Realistic price curves generated with noise and trend

### Generate New Mock Data

Edit `/lib/mocks/data.ts` and modify the sample data. The app will hot-reload!

## HTTP Backend Integration (Future)

The HTTP adapter is stubbed and ready for real API endpoints. See `/lib/adapters/http-client.ts` for expected endpoint signatures.

### Expected Backend Endpoints

```
USER:
  GET /api/user/me

CONVERSATIONS:
  GET /api/conversations
  POST /api/conversations
  POST /api/conversations/{id}/messages
  GET /api/conversations/{id}/stream (SSE)

SEARCH:
  POST /api/search

TRACKING:
  GET /api/tracked-items
  POST /api/tracked-items
  GET /api/tracked-items/{id}/prices
```

## Development Workflow

### Adding a New Page
1. Create a new folder under `app/(shell)/`
2. Add a `page.tsx` file
3. Import `getClient()` from `/lib/adapters` for data
4. Use Zustand stores for local UI state

### Adding a New Data Type
1. Add type definition to `/lib/types.ts`
2. Add mock data to `/lib/mocks/data.ts`
3. Add methods to `ShopSageClient` interface in `/lib/adapters/client.ts`
4. Implement in both `MockClient` and `HttpClient`

### Testing
- **Mock mode**: `NEXT_PUBLIC_DATA_SOURCE=mock pnpm dev` — Full functionality without backend
- **Manual testing**: Use the UI to create conversations, search, add tracking, etc.
- **Build check**: `pnpm run build` to catch TypeScript errors

## Known Limitations & TODOs

- [ ] Real authentication (currently guest UUID in localStorage)
- [ ] Price alert notifications
- [ ] Dark theme toggle
- [ ] Mobile-optimized responsive design
- [ ] API error handling and retry logic
- [ ] WebSocket support (for real-time updates)
- [ ] Search result cards with full details and CTAs
- [ ] Listing card component with images and ratings
- [ ] Export tracking data to CSV

## Contributing

### Code Style
- TypeScript strict mode enabled
- Tailwind CSS for styling (no CSS-in-JS)
- Component-based architecture
- Zustand for local state, React Query for server state

### Commit Message Format
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
refactor: Refactor code
style: Format code
chore: Maintenance task
```

## Support

For issues or questions:
1. Check `/frontend/docs/vibecoderjournal.md` for development notes
2. Review `/frontend/DEV.md` for architecture details
3. See `/frontend/docs/CONTEXT.md` for product context

---

**ShopSage Frontend v0.1.0** — Built for Southeast Asian e-commerce 🛍️
