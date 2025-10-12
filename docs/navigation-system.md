# Two-Party Navigation System

This document defines a professional dual-role navigation system for buyers and sellers, modeled on leading marketplaces (e.g., Etsy) and tailored to the existing Next.js App Router structure.

## Component Hierarchy

- PrimaryNav (top app bar)
  - LogoLink (routes to buyer home `/` by default; seller mode routes to `/seller` dashboard)
  - GlobalSearch (buyer: products/categories; seller: sequences/resources)
  - RoleSwitch (Buyer ↔ Seller)
  - UserMenu (Profile, Orders, Downloads, Settings, Logout)
  - CartButton (buyer only)
- SecondaryNav (context-aware)
  - BuyerContextNav
    - CategoriesNav (links to `/categories/[slug]`)
    - FeaturedNav (links to `/sequences?sort=popular` etc.)
  - SellerContextNav
    - SellerOpsNav (links to `/seller/sequences`, `/seller/upload`, `/seller/orders`, `/seller/payouts`, `/seller/resources`)
- SideRail (optional on desktop)
  - Breadcrumbs
  - FiltersPanel (buyer listing pages)
  - ActionsPanel (seller tools)
- FooterNav (shared)
  - Help, Guidelines, Licensing, Privacy, Terms

## Route Map & Internal Linking

- Buyer Interface
  - `/` Home (featured sequences, categories)
  - `/sequences` Listing with filters (supports `category`, `format`, `controller`, `sort`, `page`)
  - `/sequence/[id]` Detail
  - `/search` Global search
  - `/cart`, `/checkout`
  - `/orders`, `/downloads`, `/help`, `/guidelines`, `/creator-guide`
- Seller Portal
  - `/seller` Dashboard overview
  - `/seller/onboarding` Wizard
  - `/seller/upload` Upload sequence
  - `/seller/sequences` Manage listings
  - `/seller/orders` Buyer orders relevant to seller
  - `/seller/payouts` Payouts and earnings
  - `/seller/resources` Docs, best practices, Creator Guide

Linking Strategy:

- Use `next/link` with `prefetch` for top-level nav targets; disable prefetch only for heavy dashboards.
- Preserve context on role switch (carry `?returnTo=` and forward `category`, `format`, `controller` when relevant).
- Breadcrumbs reflect the active section: e.g., Buyer: `Home › Sequences › [Title]`; Seller: `Seller › Sequences › Edit`.

## User Flows (Text Diagrams)

Buyer Purchase Flow:

- Home → Sequences (filters) → Sequence Detail → Add to Cart → Checkout → Orders → Downloads

Buyer Discovery Flow:

- Search → Listing → Apply Filters (format/controller) → Detail → Favorite or Purchase

Seller Publishing Flow:

- Seller Dashboard → Upload (FSEQ + optional ZIP, audio license) → Review → Publish → Listing appears in Buyer Sequences

Seller Management Flow:

- Seller Dashboard → Sequences → Edit/Unpublish → Orders → Payouts → Resources

## Interaction Specifications

- Hover/Focus states: consistent tokens; focus-visible outlines for keyboard navigation.
- RoleSwitch: instantaneous context change with toast confirmation; retains auth session; redirects to section root (buyer `/`, seller `/seller`).
- PrimaryNav sticky at `top: 0`; SecondaryNav follows content region; SideRail collapsible on mobile.
- Keyboard shortcuts: `/` focuses search, `g s` goes to Seller Dashboard (if seller), `g h` to Home.
- Breadcrumbs: clickable segments; final segment is current page (non-clickable).
- Responsive behaviors:
  - Mobile: PrimaryNav condenses to hamburger + search; SecondaryNav becomes a sheet/drawer.
  - Tablet/Desktop: show full menus; SideRail visible for filters/tools.

## Competitive Analysis Highlights (Etsy.com and peers)

- Clear separation of buyer marketplace and seller portal while retaining shared styling and top-level nav consistency.
- Prominent global search and category navigation for discovery.
- Seller tools grouped under a dedicated dashboard with resource links and publishing actions.
- Role switching available via profile menu; ensure immediate context change and clear feedback.

## Consistency Guarantees

- Identical visual tokens, spacing system, motion durations, and iconography across buyer and seller.
- Shared components: `PrimaryNav`, `SecondaryNav`, `Breadcrumbs`, `FooterNav` with role-aware item sets.
- Testing: visual regression snapshots for both modes; accessibility checks on interactive elements.
