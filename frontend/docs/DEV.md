# ShopSage Frontend (Mock-first, Adapter-based)

## What is this?
A Next.js (TS) frontend for ShopSage with Search, Tracking, History, Settings. It runs end-to-end in **mock mode** now and can swap to real APIs later by changing one env var.

## Run
- Install deps at repo root (uses existing package manager).
- Dev: `pnpm dev -F web-frontend` (or the repo’s equivalent)
- Env: `NEXT_PUBLIC_DATA_SOURCE=mock` (default) or `http`

## Folder map
frontend/
  app/(shell)/layout.tsx
  app/search/page.tsx
  app/tracking/page.tsx
  app/tracking/[id]/page.tsx
  app/history/page.tsx
  app/settings/page.tsx
  components/{navbar, chat, cards, tracking}/...
  lib/adapters/{index.ts, mockClient.ts, httpClient.ts}
  lib/{types.ts, sse.ts, stores/*}
  README.md / DEV.md

## Adapter contract (UI depends ONLY on this)
```ts
export interface ShopSageClient {
  whoAmI(): Promise<User>;
  listConversations(): Promise<Conversation[]>;
  createConversation(agent: 'product'|'supplier'): Promise<Conversation>;
  sendMessage(conversationId: string, content: string): Promise<void>;
  streamMessages(conversationId: string, onEvent: (m: Message) => void): () => void;
  search(query: string): Promise<Listing[]>;
  addTrackedItem(input: { sku?: string; modelName?: string; listingIds?: string[] }): Promise<TrackedItem>;
  listTrackedItems(): Promise<TrackedItem[]>;
  getPrices(trackedItemId: string, range: string): Promise<PricePoint[]>;
}
