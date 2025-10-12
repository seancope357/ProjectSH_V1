# Supabase Integration Requirements

This document outlines the specific Supabase configuration changes and backend modifications to support the dual-role navigation and seamless transitions.

## Profile Schema Adjustments

Add role and navigation preferences to `profiles` table:

```sql
-- profiles table adjustments
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('buyer','seller','both')) DEFAULT 'buyer',
  ADD COLUMN IF NOT EXISTS default_role TEXT CHECK (default_role IN ('buyer','seller')) DEFAULT 'buyer',
  ADD COLUMN IF NOT EXISTS last_role TEXT CHECK (last_role IN ('buyer','seller')),
  ADD COLUMN IF NOT EXISTS last_buyer_path TEXT,
  ADD COLUMN IF NOT EXISTS last_seller_path TEXT;
```

Purpose:

- Drive RoleSwitch logic and remember last paths for smooth transitions post-auth.

## RLS Policies

Ensure seller portal resources are restricted to owner:

```sql
-- Example RLS for seller sequences
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY seller_can_manage_own_sequences
  ON sequences FOR ALL
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- Buyers can read published sequences
CREATE POLICY buyers_can_read_published
  ON sequences FOR SELECT
  USING (status = 'published');
```

Also ensure orders/payouts tables have owner-based policies.

## Navigation Preferences Endpoint

Create endpoint to update profile navigation fields on role switch:

- Path: `/api/profile/preferences` (PATCH)
- Body: `{ last_role, last_buyer_path, last_seller_path }`
- Secured via session; writes to `profiles`.

## Seller Onboarding Guard

- Middleware checks: if path starts with `/seller` and user role !== seller, redirect to `/seller/onboarding?returnTo=<original>`.
- After onboarding completion, set `role='seller'`, `default_role='seller'` if desired.

## Data Needed for Buyer Filters

- Ensure `sequences` table contains fields used in navigation/listing filters:

```sql
ALTER TABLE sequences
  ADD COLUMN IF NOT EXISTS format TEXT,
  ADD COLUMN IF NOT EXISTS controllers TEXT[];
```

These fields are already referenced in API; confirm presence and backfill for legacy rows.

## Performance & Indexing

Add indexes for common navigation queries:

```sql
CREATE INDEX IF NOT EXISTS sequences_format_idx ON sequences (format);
CREATE INDEX IF NOT EXISTS sequences_controllers_gin_idx ON sequences USING GIN (controllers);
CREATE INDEX IF NOT EXISTS sequences_category_idx ON sequences (category);
```

## Audit & Logging

- Optional: add a lightweight `navigation_events` table to analyze flows (role switches, menu opens). Respect privacy and retention.

```sql
CREATE TABLE IF NOT EXISTS navigation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles (id) ON DELETE SET NULL,
  event_type TEXT CHECK (event_type IN ('role_switch','menu_open','menu_close')),
  from_role TEXT,
  to_role TEXT,
  path TEXT,
  created_at timestamptz DEFAULT now()
);
```

## Backend Modifications Summary

- Update API to accept and persist navigation preferences.
- Extend sequences API filters to use `format` and `controllers` columns (done client-side; confirm server).
- Tighten middleware role guards for seller routes.
- Add indexes for performance on listing queries.
