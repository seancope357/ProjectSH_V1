# Technical Implementation Plan

## 1. Analysis of Current State

### Frontend Architecture
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS
- **Key Components**:
  - `src/components/ui/marketplace-home.tsx`: Client-side landing page with interactive search.
  - `src/app/sequences/page.tsx`: Server-side "Browse" page with filtering and grid layout.
  - `src/app/sequence/[id]/page.tsx`: Server-side "Product Detail" page with sticky buy box.
  - `src/components/providers/session-provider.tsx`: Supabase authentication context.
- **State Management**: Mixed approach using Server Components for initial data load and React Client state for interactivity (filtering, cart).

### Backend API & Services
- **Database**: Supabase (PostgreSQL).
- **Integration Layer**: `src/lib/supabase-db.ts` provides a typed interface for DB operations.
- **Services**: `src/lib/market-service.ts` acts as the business logic layer, aggregating data for insights and search.
- **API Routes**: Comprehensive set of endpoints (`api/sequences`, `api/cart`, etc.) supporting the frontend.

### Landing Page Status
- **Design**: Modern, performance-focused design (hero animation removed).
- **Optimization**: Converted to Server Component (`src/app/page.tsx`) to fetch insights on the server, eliminating client-side waterfalls.
- **Navigation**: Updated to direct users to the new `/sequences` browse experience.

---

## 2. Frontend-Backend Connection Plan

The connection is largely established, but we will formalize the data flow patterns.

### A. Data Fetching Strategy
- **Server Components (Read Operations)**:
  - Use `src/lib/supabase-db.ts` directly or via `market-service.ts`.
  - **Pattern**: `await db.sequences.findMany()` in `page.tsx`.
  - **Benefit**: Faster First Contentful Paint (FCP), better SEO.

- **Client Components (Write Operations / Interactivity)**:
  - Use standard `fetch` to call Next.js API Routes.
  - **Pattern**: `fetch('/api/cart', { method: 'POST' })` inside event handlers.
  - **Benefit**: Securely handles cookies/session tokens via the API layer.

### B. Required API Endpoints (Verified)
- `GET /api/sequences`: Search and filter sequences (Implemented).
- `POST /api/cart`: Add items to cart (Implemented).
- `GET /api/market/trending`: Landing page stats (Implemented via direct server call, endpoint remains for external use).

### C. Implementation Steps (Executed)
1.  **Search Integration**:
    - Updated `marketplace-home.tsx` to push to `/sequences` with query parameters.
    - Updated `src/app/sequences/page.tsx` to read `searchParams` and query the DB.
2.  **Product Details**:
    - Implemented `src/app/sequence/[id]/page.tsx` to fetch sequence details + reviews in parallel.
    - Added `AddToCart` client component to handle purchase logic.

---

## 3. Landing Page Update Plan

### A. Design Review
- **Current**: sleek, CSS-only hero, "Browse All" CTA, "Sell Your Work" secondary CTA.
- **Improvement**: Ensure all links point to the modern server-side pages (`/sequences` instead of `/search`).

### B. Performance Optimization
- **Image Loading**: Ensure `next/image` is used with `priority` for above-the-fold content (Hero).
- **Code Splitting**: The `MarketplaceHome` component is already a client boundary, keeping the main layout server-rendered.

### C. Implementation Steps (Executed)
1.  **Routing Fixes**:
    - Redirected landing page Search to `/sequences` (Browse page).
    - Redirected Category chips to `/sequences?category=...`.
2.  **Visual Polish**:
    - Updated buttons to `rounded-full` for a more modern aesthetic.
    - Enhanced shadow depth on CTAs.

---

## 4. Testing Procedures

1.  **Search Flow**:
    - Type "Christmas" in the landing page search bar -> Enter.
    - **Expected**: Redirect to `/sequences?q=Christmas`, showing grid results.

2.  **Browse Flow**:
    - Click "Browse All Sequences".
    - **Expected**: Navigate to `/sequences`, sidebar filters visible.

3.  **Purchase Flow**:
    - Click a sequence -> Detail page.
    - Click "Add to Cart" -> Redirect/Update UI.

4.  **Performance**:
    - Run Lighthouse audit (Target: 90+ Performance).
    - Verify zero layout shifts (CLS < 0.1).
