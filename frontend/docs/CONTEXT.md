# ShopSage Project Context

## Overview
ShopSage is an AI-powered **shopping research and tracking assistant** built for the **Southeast Asian e-commerce ecosystem**.  
It reduces the cognitive load of online shopping by helping users:
1. Discover the best **product models** that match their needs.
2. Compare **suppliers and listings** across platforms.
3. Track **prices and product data** over time.

The system currently consists of two major intelligent agents, each handling a different part of the shopping journey:
- **Product Research Agent**
- **Supplier Research Agent**

A third planned component — the **Frontend** — will serve as the unified interface connecting users with both agents and the eventual tracking system.

---

## Core User Flows

### 1. Product Research
**User Goal:** “I know I want *a pair of headphones*, but I don’t know *which brand or model* to buy.”

**Agent Role:**  
- Acts like a product analyst or consultant.  
- Uses natural conversation to help users define preferences (budget, features, reviews).  
- Returns structured recommendations of product models (e.g., Sony WH-1000XM5 vs Bose QC45).  
- Displays reasoning, pros/cons, and external links to listings.

**Frontend Implication:**  
- **Semantic Search UI** that takes open-ended user prompts.  
- **Response Cards** showing summarized recommendations.  
- Users can “Add to Saved Products” or “Add to Tracking” from results.

---

### 2. Supplier Research
**User Goal:** “I already know I want the *Sony WH-1000XM5*, but I don’t know *which listing or supplier* to buy from.”

**Agent Role:**  
- Aggregates listings from platforms like Shopee, Lazada, or Tokopedia.  
- Compares price, shipping time, and seller trustworthiness.  
- Surfaces the best deal or value-for-money option.

**Frontend Implication:**  
- **Supplier Comparison Flow** showing listing cards with pricing, ratings, and seller reputation.  
- User can click “Open Listing / Buy Now” or “Add to Active Tracking.”  
- Ties into the product tracking feature for long-term monitoring.

---

### 3. Product Tracking
**User Goal:** “I want to monitor the price of a product I’m interested in.”

**Agent Role:**  
- Tracks price changes over time (daily snapshots).  
- Can alert users to discounts, stock changes, or trend patterns.  
- Integrates with external data scrapers (e.g., Google Shopping, platform APIs).

**Frontend Implication:**  
- **Active Tracking Page** showing:
  - 90-day pricing chart.
  - Active tracked items.
  - Listings under each tracked product.
- **Saved Products** tab for archived or wishlisted items.

---

## Frontend Vision
The frontend is a **mock-first, adapter-based Next.js (TypeScript)** application.  
Its purpose is to provide a functional UI for ShopSage that can later be connected to the backend’s FastAPI endpoints.

**Initial Scope:**
- Build navigable pages for:
  - `/search` → Product & Supplier research (chat-like interface)
  - `/tracking` → Tracked items overview
  - `/tracking/[id]` → Individual product tracking chart
  - `/history` → Past research sessions
  - `/settings` → User preferences
- Implement mock data adapters (replaceable later with REST APIs).

**Frontend should:**
- Reflect the attached navigation and flow diagrams.
- Use simple, clear components:
  - **ResponseCard** → for research results
  - **TrackingChart** → for price visualization
  - **Navbar / Chat interface** → for navigation and queries
- Operate with mock data until integrated with FastAPI endpoints.

---

## Technology Overview
| Layer | Description |
|-------|--------------|
| **Backend Agents** | Product and supplier research agents built using LangGraph + FastAPI. |
| **Frontend** | Next.js + TypeScript app consuming REST/SSE endpoints through an adapter. |
| **Adapter Layer** | Provides both `mockClient` and `httpClient`; UI only talks through this interface. |
| **Tracking Engine** | Python-based scrapers (e.g., `google_shopping_scraper`) providing real price data. |

---

## Integration Goals
1. **Short Term:**  
   Build a standalone mock frontend that runs independently, demonstrating the full UX with placeholder data.

2. **Mid Term:**  
   Connect the adapter’s `httpClient` to actual FastAPI routes exposed by the agents.

3. **Long Term:**  
   Evolve into a full-stack system where:
   - User authentication (FastAPI or Auth.js) persists sessions and histories.
   - Agents store user interactions and product metadata in a shared database.
   - The tracking engine continuously updates price and product information.

---

## Key Terms
| Term | Meaning |
|------|----------|
| **Product Research** | Discovering *what product model* best fits a user’s needs. |
| **Supplier Research** | Comparing *which listing or supplier* to buy from. |
| **Tracked Product** | A saved product monitored for price or stock changes. |
| **Listing** | A single seller’s offer for a product (with its own price, seller rating, etc.). |
| **Active Tracking** | Products currently being price-tracked by the system. |
| **Saved Products** | Products the user saved for future research but is not tracking actively. |

---

## Attached References
- `Nav_Diagram.png` — Navigation and component structure.
- `Product_Discovery_User_Flow.png` — Product research flow.
- `Product_Tracking_Flow.png` — Price tracking flow.
- `Lofi_Prototypes.png` — Low-fidelity UI sketches.
- `DEV.md` — Developer setup and adapter interface documentation.
- `Colour_Scheme.png` - Colours to be used whilst building the UI

---

**Author:** Marcus Chao  
**Date:** November 2025  
**For:** ShopSage Frontend Development & Integration Team
