# ShopSage Frontend Developer Guide

This is the comprehensive guide for extending, debugging, and integrating the ShopSage frontend.

## Architecture Overview

### The Adapter Pattern

The **core design principle** is **complete separation between UI and data source**:

```
┌─────────────────────────────────────────────┐
│  React Components (pages, components)       │
│  - Use getClient() from @/lib/adapters      │
│  - Call only ShopSageClient interface       │
└────────────────┬────────────────────────────┘
                 │ (only talks to adapters)
                 │
        ┌────────▼──────────┐
        │  ShopSageClient   │
        │  (interface)      │
        └────────┬──────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
┌────▼────────┐      ┌──────▼──────┐
│ MockClient  │      │ HttpClient  │
│ (in-memory) │      │ (REST/SSE)  │
└─────────────┘      └─────────────┘
     │ localStorage          │ fetch
     │ + runtime memory      │ EventSource
```

**Key Benefit**: Change `NEXT_PUBLIC_DATA_SOURCE=http` and the entire app switches to real API calls without touching a single component.

## ShopSageClient Interface Contract

All implementations must satisfy:

```typescript
export interface ShopSageClient {
  // User
  whoAmI(): Promise<User>;

  // Conversations (chat history)
  listConversations(): Promise<Conversation[]>;
  createConversation(agent: 'product'|'supplier'): Promise<Conversation>;
  sendMessage(conversationId: string, content: string): Promise<void>;
  streamMessages(conversationId: string, onEvent: (m: StreamMessageEvent) => void): () => void;

  // Search
  search(query: string): Promise<Listing[]>;

  // Tracking
  addTrackedItem(input: AddTrackedItemInput): Promise<TrackedItem>;
  listTrackedItems(): Promise<TrackedItem[]>;
  getPrices(trackedItemId: string, range: string): Promise<PricePoint[]>;
}
```

### Implementing a New Client

Create `lib/adapters/my-client.ts`:

```typescript
import type { ShopSageClient } from "./client";

class MyClient implements ShopSageClient {
  async whoAmI(): Promise<User> {
    // Implementation
  }
  // ... implement all 10 methods
}

export function getMyClient(): ShopSageClient {
  return new MyClient();
}
```

Then update `lib/adapters/index.ts`:

```typescript
const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE || "mock";

if (dataSource === "http") {
  clientInstance = getHttpClient();
} else if (dataSource === "my-client") {
  clientInstance = getMyClient();
} else {
  clientInstance = getMockClient();
}
```

## Using the Client in Components

### Functional Component Pattern

```typescript
"use client"; // Mark as client component

import { getClient } from "@/lib/adapters";
import type { Conversation } from "@/lib/types";
import { useState, useEffect } from "react";

export default function MyComponent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const client = getClient(); // Get the active client

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const convs = await client.listConversations();
        setConversations(convs);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [client]);

  return (
    <div>
      {conversations.map(conv => (
        <div key={conv.id}>{conv.title}</div>
      ))}
    </div>
  );
}
```

### Streaming Pattern

For real-time message streaming (in `/search/page.tsx`):

```typescript
const handleSendMessage = async () => {
  try {
    setStreaming(true);
    setStreamingText("");

    // Tell backend to stream messages
    const unsubscribe = client.streamMessages(
      conversationId,
      (event) => {
        if (event.type === "chunk") {
          setStreamingText(prev => prev + event.content);
        } else if (event.type === "complete") {
          setStreaming(false);
          // Save the full message
          // ...
        } else if (event.type === "error") {
          console.error(event.error);
        }
      }
    );

    // Optional: cancel streaming early
    // unsubscribe();
  } finally {
    // cleanup
  }
};
```

## State Management with Zustand

### Creating a Store

```typescript
// lib/stores/my.store.ts
import { create } from "zustand";

interface MyStore {
  count: number;
  increment: () => void;
  reset: () => void;
}

export const useMyStore = create<MyStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));
```

### Using a Store

```typescript
import { useMyStore } from "@/lib/stores/my.store";

export function MyComponent() {
  const count = useMyStore((state) => state.count);
  const increment = useMyStore((state) => state.increment);

  return (
    <button onClick={increment}>
      Count: {count}
    </button>
  );
}
```

### Available Stores

- **`useUserStore`**: Current user identity
- **`useConversationStore`**: Active conversation + messages + streaming state
- **`useTrackingStore`**: Tracked items + selected item + price history

## Adding New Pages

### 1. Create Route Folder

```
app/(shell)/my-page/page.tsx
```

### 2. Make it a Client Component

```typescript
"use client"; // Enable hooks and client-side features

// imports...

export default function MyPagePage() {
  // component code
}
```

### 3. Use the Client

```typescript
import { getClient } from "@/lib/adapters";

export default function MyPagePage() {
  const client = getClient();

  useEffect(() => {
    const data = await client.listConversations();
    // ...
  }, [client]);
}
```

## Adding New Data Types

### 1. Define Type in `/lib/types.ts`

```typescript
export interface MyType {
  id: string;
  name: string;
  createdAt: Date;
}
```

### 2. Add to Adapter Interface

```typescript
// lib/adapters/client.ts
export interface ShopSageClient {
  // ... existing methods
  getMyData(): Promise<MyType[]>;
}
```

### 3. Implement in MockClient

```typescript
// lib/adapters/mock-client.ts
async getMyData(): Promise<MyType[]> {
  await this.delay(200);
  return [
    { id: "1", name: "Sample", createdAt: new Date() },
  ];
}
```

### 4. Implement in HttpClient (Stubs)

```typescript
// lib/adapters/http-client.ts
async getMyData(): Promise<MyType[]> {
  const res = await fetch(`${this.apiUrl}/api/my-data`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

### 5. Add Mock Data

```typescript
// lib/mocks/data.ts
export const mockMyData: MyType[] = [
  { id: "1", name: "Sample", createdAt: new Date() },
];
```

## Styling

### Tailwind Classes

All styling uses **Tailwind CSS**. Color scheme from `Colour_Scheme.png`:

```css
/* Primary: Blue #2563eb */
.btn-primary { @apply bg-primary text-white; }

/* Secondary: Green #10b981 (success/CTA) */
.btn-secondary { @apply bg-secondary text-white; }

/* Accent: Amber #f59e0b (warnings) */
.btn-accent { @apply bg-accent text-white; }

/* Dark: #1f2937 */
.text-dark { @apply text-dark; }

/* Light: #f9fafb */
.bg-light { @apply bg-light; }
```

### Component Classes

Defined in `app/globals.css`:

```css
.btn { /* button base styles */ }
.btn-primary { /* blue button */ }
.btn-outline { /* outlined button */ }
.card { /* card with shadow */ }
.chat-bubble-user { /* right-aligned message */ }
.chat-bubble-assistant { /* left-aligned message */ }
```

### Responsive Design

```typescript
<div className="
  grid
  grid-cols-1         /* 1 column on mobile */
  md:grid-cols-2      /* 2 columns on medium screens */
  lg:grid-cols-3      /* 3 columns on large screens */
  gap-4               /* space between items */
">
```

## Testing & Debugging

### Running in Development

```bash
cd frontend
NEXT_PUBLIC_DATA_SOURCE=mock pnpm dev
```

Open [http://localhost:3000/search](http://localhost:3000/search) and start interacting.

### Browser DevTools

- **localStorage**: Guest ID is stored under `shopsage_user_id`
- **Network tab**: Check HTTP calls (in http mode)
- **Console**: Errors and logs

### Debugging Stores

Add to any page:

```typescript
import { useUserStore } from "@/lib/stores/user.store";

export default function DebugPage() {
  const user = useUserStore();
  console.log("User state:", user);

  return (
    <pre>{JSON.stringify(user, null, 2)}</pre>
  );
}
```

### Mock Data Manipulation

In the browser console:

```javascript
// View localStorage
console.log(localStorage.getItem('shopsage_user_id'));

// Set mock data source
localStorage.setItem('DEBUG_DATA_SOURCE', 'mock');

// View Zustand store (if exposed)
// (requires special setup)
```

## Performance Optimization

### Code Splitting

Next.js automatically code-splits at routes:
- `/search` loads separately from `/tracking`
- `/tracking/[id]` doesn't load until clicked

### Image Optimization

Use Next.js `Image` component (future):

```typescript
import Image from "next/image";

<Image
  src="/product.jpg"
  alt="Product"
  width={300}
  height={300}
/>
```

### Query Deduplication

React Query (future) will cache responses:

```typescript
// Both calls return cached data after first request
const data1 = await client.listConversations();
const data2 = await client.listConversations();
```

## Error Handling

### Try-Catch Pattern

```typescript
try {
  const data = await client.listConversations();
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  setError(message);
  console.error(error);
}
```

### User-Facing Errors

```typescript
{error && (
  <div className="bg-red-50 border border-red-200 rounded p-4">
    <p className="text-red-600">{error}</p>
  </div>
)}
```

### Network Retry (TODO)

```typescript
// Future: Add exponential backoff retry logic
async function retryFetch(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(Math.pow(2, i) * 1000);
    }
  }
}
```

## Integration Checklist (When Backend is Ready)

- [ ] Set up FastAPI server with endpoints (see `/lib/adapters/http-client.ts` comments)
- [ ] Test HTTP client with real backend
- [ ] Add authentication (replace guest UUID with real auth)
- [ ] Set up error boundaries and global error handling
- [ ] Add error toast notifications
- [ ] Implement retry logic for network requests
- [ ] Set up analytics/logging
- [ ] Add input validation on forms
- [ ] Set up CI/CD pipeline

## Common Issues & Solutions

### Issue: "Client used as server component"
**Solution**: Add `"use client"` directive to your component:
```typescript
"use client";
export default function MyPage() { ... }
```

### Issue: Hydration mismatch
**Solution**: Don't read `localStorage` directly in render:
```typescript
// ❌ Wrong
const userId = localStorage.getItem('user_id');

// ✅ Right
useEffect(() => {
  const userId = localStorage.getItem('user_id');
}, []);
```

### Issue: Zustand state loses data on refresh
**Solution**: Persist to localStorage:
```typescript
// In store creation
export const useMyStore = create(
  persist(
    (set) => ({ /* ... */ }),
    { name: "my-store" }
  )
);
```

### Issue: Build fails with TypeScript errors
**Solution**: Run strict type check:
```bash
pnpm build 2>&1 | head -50
```

## Further Reading

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Recharts Docs](https://recharts.org/)

---

**Last Updated**: November 2025
**Frontend Version**: 0.1.0
**Status**: Mock-first, ready for HTTP backend integration
