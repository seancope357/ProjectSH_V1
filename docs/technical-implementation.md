# Technical Implementation Plan

This plan covers linking, state management, performance, and responsive behavior to implement the two-party navigation.

## Linking Strategy

- Use `next/link` for all nav items; enable `prefetch` on lightweight routes (`/`, `/sequences`, `/search`).
- Disable prefetch on heavy seller routes (`/seller/sequences`, `/seller/payouts`) to reduce CPU and bandwidth.
- RoleSwitch behavior:
  - If user is authenticated as seller, clicking Seller switches to `/seller`.
  - If not yet seller, go to `/seller/onboarding` with `?returnTo=<current>`.
  - Preserve query context when switching sections where meaningful (e.g., filters on listing pages).
- Breadcrumbs generated from pathname segments; configurable labels per route in a map.

## State Management Approach

- Global `NavContext` in `src/components/providers/NavProvider.tsx` (or reuse existing provider):
  - `role: 'buyer' | 'seller'` (derived from profile and current path)
  - `mobileMenuOpen: boolean`
  - `secondaryNavActive: string | null` (e.g., category slug or seller tab)
  - `lastBuyerPath`, `lastSellerPath` (persisted in `localStorage`)
- Server state via Supabase profile:
  - `default_role`, `last_role`, `last_buyer_path`, `last_seller_path`
- Integrate with middleware to redirect to last known role path after login.

## Performance Considerations

- Navigation components as server components where possible; client islands for interactive parts (RoleSwitch, Search, mobile menu).
- Use `next/font` for typography to avoid FOUT and minimize layout shift.
- Memoize large menus; avoid rendering heavy seller analytics in nav.
- Prefetch critical buyer routes on hover (Link) and on idle using `requestIdleCallback` gated by network conditions.
- Lazy-load icon sets; import individual icons.

## Responsive Design

- Breakpoints: `sm`, `md`, `lg`, `xl` (Tailwind defaults).
- Mobile: hamburger toggles a `Dialog`/`Sheet` component listing primary and secondary nav items.
- Desktop: sticky PrimaryNav, inline SecondaryNav; SideRail visible on listing/dashboard pages.
- Ensure hit areas and focus outlines meet accessibility requirements.

## Component Contracts (Props)

- `<PrimaryNav role="buyer|seller" onRoleChange={...} />`
  - slots: `left`, `center`, `right`
  - shows LogoLink, GlobalSearch, RoleSwitch, CartButton (buyer), UserMenu
- `<SecondaryNav role="buyer|seller" activeKey={...} onChange={...} />`
  - buyer items: Categories, Featured, New, Popular
  - seller items: Sequences, Upload, Orders, Payouts, Resources
- `<Breadcrumbs segments={[{href,label}, ...]} />`
- `<SideRail variant="filters|tools" />`

## Testing & QA

- Visual regression tests across buyer/seller in Chrome and Safari.
- Accessibility tests: `@testing-library` focus order, `axe-core` checks.
- Performance: Lighthouse scores and Web Vitals (CLS ≤ 0.1, LCP ≤ 2.5s).
