## Phase 1: Authentication & Redirection Fixes
1. **Update `src/app/auth/signin/page.tsx`**:
   - Change default `callbackUrl` from `/` to `/dashboard`.
   - Standardize on `router.replace` for all redirects to ensure a clean history.
   - Update OAuth configuration to use the new dashboard-first default.
2. **Update `src/lib/supabase-middleware.ts`**:
   - Add a "Guest Only" guard that redirects logged-in users away from `/auth/signin` and `/auth/signup` directly to `/dashboard`.
3. **Update `src/components/ui/primary-nav.tsx`**:
   - Ensure the "Sign In" button explicitly points to the dashboard as the intended destination.

## Phase 2: Dashboard Accessibility
1. **Verify Route Integrity**: Ensure `/dashboard` and `/seller/dashboard` are correctly exported and not conflicting with middleware logic.
2. **Session Synchronization**: Ensure the `NavigationProvider` and `AuthSessionProvider` are not creating race conditions that stall the initial redirect.

## Phase 3: Verification
1. Run a build check to ensure no new dependency issues.
2. Verify the flow: Guest -> Sign In -> Dashboard.
