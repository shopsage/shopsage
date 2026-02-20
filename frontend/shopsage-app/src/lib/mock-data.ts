// Mock product data matching the search.html prototype

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: string;
  platform: string;
  imageUrl?: string;
  badge?: string;
  image?: string;
}

export interface TrackedItem extends Product {
  targetPrice: number;
  image?: string;
  currentPrice: number;
  priceHistory?: { date: string; price: number }[];
}

export const mockProducts: Product[] = [
  {
    id: "sony-wh1000xm5",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling",
    price: 319,
    originalPrice: 379,
    rating: 4.9,
    reviewCount: "2.1k",
    platform: "Shopee",
    badge: "Best Deal",
    image: "/images/Sony_WH-1000XM5.jpg",
  },
  {
    id: "bose-qc45",
    title: "Bose QuietComfort 45 Bluetooth Wireless",
    price: 279,
    originalPrice: 329,
    rating: 4.7,
    reviewCount: "856",
    platform: "Lazada",
    image: "/images/Bose_QuietComfort45.jpg",
  },
];

export const mockTrackedItems: TrackedItem[] = [
  {
    id: "sony-wh1000xm5",
    title: "Sony WH-1000XM5",
    price: 319,
    currentPrice: 319,
    targetPrice: 300,
    image: "/images/Sony_WH-1000XM5.jpg",
    rating: 4.9,
    reviewCount: "2.1k",
    platform: "Shopee",
    priceHistory: [
      { date: "2024-01-01", price: 379 },
      { date: "2024-01-15", price: 349 },
      { date: "2024-02-01", price: 319 },
    ],
  },
];

export interface SourceItem {
  title: string;
  url: string;
}

export interface SourceGroup {
  label: string;
  sources: SourceItem[];
}

// Demo conversation script
export type MessageContent =
  | { type: "text"; text: string }
  | { type: "preferences"; options: PreferenceGroup[] }
  | { type: "products"; products: Product[]; followUpText?: string }
  | { type: "priceInput"; productId: string; currentPrice: number }
  | { type: "trackingConfirmation"; product: TrackedItem }
  | { type: "sources"; sourceGroups: SourceGroup[] };

export interface PreferenceGroup {
  label: string;
  options: { value: string; label: string; selected?: boolean }[];
}

export interface DemoMessage {
  id: string;
  role: "user" | "assistant";
  content: MessageContent[];
  timestamp?: Date;
}

export const demoScript: DemoMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: [{ type: "text", text: "I'm looking for some good noise cancelling headphones" }],
  },
  {
    id: "msg-2",
    role: "assistant",
    content: [
      { type: "text", text: "I can help with that! To narrow it down:" },
      {
        type: "preferences",
        options: [
          {
            label: "Type",
            options: [
              { value: "over-ear", label: "Over-ear" },
              { value: "in-ear", label: "In-ear" },
            ],
          },
          {
            label: "Budget",
            options: [
              { value: "under-200", label: "Under $200" },
              { value: "under-350", label: "Under $350" },
              { value: "under-500", label: "Under $500" },
              { value: "500-plus", label: "$500+" },
            ],
          },
          {
            label: "Other",
            options: [],
          },
        ],
      },
    ],
  },
  {
    id: "msg-3",
    role: "user",
    content: [{ type: "text", text: "In-ear, under $350" }],
  },
  {
    id: "msg-4",
    role: "assistant",
    content: [
      { type: "text", text: "Got it. Here are the top-rated options within your budget:" },
      { type: "products", products: mockProducts },
      {
        type: "text",
        text: `The <strong>Sony WH-1000XM5</strong> is your best bet for silence. Its noise cancellation is unmatched, perfect for commuting.<br><br>If comfort is your priority for long listening sessions, the <strong>Bose QuietComfort 45</strong> is lighter and has a more relaxed fit.<br><br>Both are excellent, but the Sony has a slight edge in battery life (30h vs 24h).<br><br>Let me know which item suits your preference. If you'd like, I can help you buy now or track price first.`,
      },
    ],
  },
  {
    id: "msg-5",
    role: "user",
    content: [{ type: "text", text: "Track the Sony one" }],
  },
  {
    id: "msg-6",
    role: "assistant",
    content: [
      { type: "text", text: "Sure thing. What's your target price?" },
      { type: "priceInput", productId: "sony-wh1000xm5", currentPrice: 319 },
    ],
  },
  {
    id: "msg-7",
    role: "user",
    content: [{ type: "text", text: "$300" }],
  },
  {
    id: "msg-8",
    role: "assistant",
    content: [
      { type: "text", text: "All set. I'll notify you when the price hits your target." },
      {
        type: "trackingConfirmation",
        product: {
          id: "sony-wh1000xm5",
          title: "Sony WH-1000XM5",
          price: 319,
          currentPrice: 319,
          targetPrice: 300,
    image: "/images/Sony_WH-1000XM5.jpg",
          rating: 4.9,
          reviewCount: "2.1k",
          platform: "Shopee",
        },
      },
    ],
  },
];

