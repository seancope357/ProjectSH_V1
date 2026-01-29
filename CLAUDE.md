# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SequenceHUB is a marketplace platform for xLights sequence creators to sell and buyers to purchase premium Christmas light display sequences. Built with Next.js 15, TypeScript, Supabase, and Stripe.

**Core Functionality:**
- **Marketplace**: Browse and purchase xLights sequences
- **Creator Platform**: Sell sequences with automated delivery and payment processing
- **Studio**: AI-powered sequence creation tool with 3D visualization (using Three.js)
- **Authentication**: Supabase Auth with profile management
- **Payments**: Stripe integration for transactions

## Development Commands

### Primary Development Workflow

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Supabase Local Development

The project uses Supabase for backend services. Local Supabase instance runs on:
- API: `http://127.0.0.1:54321`
- Database: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Studio UI: `http://127.0.0.1:54323`

**Important Supabase Commands:**
```bash
# Start local Supabase (from root directory)
npx supabase start

# Stop local Supabase
npx supabase stop

# Reset database (careful - destroys data)
npx supabase db reset

# Create new migration
npx supabase migration new <migration_name>

# Generate TypeScript types from database schema
npx supabase gen types typescript --local > src/types/database.ts

# Push migrations to remote
npx supabase db push
```

## Architecture & Code Organization

### Directory Structure

```
src/
├── app/                    # Next.js 15 App Router pages
│   ├── browse/            # Browse sequences marketplace
│   ├── marketplace/       # Marketplace views
│   ├── studio/            # AI sequence creation studio
│   │   ├── new/          # New sequence creation flow
│   │   └── page.tsx      # Studio dashboard
│   ├── page.tsx           # Landing page (marketing-focused)
│   └── layout.tsx         # Root layout with global styles
├── components/
│   ├── auth/             # Authentication components
│   ├── cart/             # Shopping cart components
│   ├── dashboard/        # User dashboard components
│   ├── layout/           # Layout components (Navigation, Sidebar)
│   ├── marketplace/      # Marketplace-specific components (SequenceCard)
│   └── ui/               # Reusable UI components (Button, Card)
├── lib/
│   ├── supabase/         # Supabase client configuration
│   │   ├── client.ts    # Browser client
│   │   ├── server.ts    # Server-side client
│   │   └── middleware.ts # Auth middleware
│   ├── studio/           # Studio-related utilities
│   │   └── visualizer.ts # Three.js 3D visualizer (100k+ LED support)
│   └── utils.ts          # General utilities
├── types/
│   ├── database.ts       # Generated Supabase types
│   └── studio.ts         # Studio/visualizer types
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
└── data/                 # Static data and constants
```

### Database Schema

**Core Tables:**
- `profiles`: User profiles with seller status
- `sequences`: Sequence listings (title, price, files, metadata)
- `purchases`: Transaction records linked to Stripe payment intents
- `reviews`: User reviews and ratings (if implemented)

**Key Relationships:**
- `sequences.seller_id` → `profiles.id`
- `purchases.buyer_id` → `profiles.id`
- `purchases.sequence_id` → `sequences.id`

**Migrations Location:** `supabase/migrations/`
- Initial schema: `20250910232737_sequencehub_schema.sql`
- AI Studio schema: `20250117_ai_studio_schema.sql`

### Styling System

**Tailwind CSS 4.0** with custom color system:
- `primary`: Main brand color (blue/purple tones)
- `secondary`: Accent color
- `accent`: Highlight color
- `background`: Dark theme background
- `surface`: Card/surface backgrounds

**Custom Utilities:**
- `hover-glow-primary`: Adds glow effect on hover
- `font-heading`: Display font for headings

**Global Styles:** `src/app/globals.css`

### Authentication Flow

Uses Supabase Auth with SSR support via `@supabase/ssr`.

**Client-side Auth:**
```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

**Server-side Auth (Server Components, Route Handlers):**
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = createClient()
```

**Middleware:** `src/lib/supabase/middleware.ts` handles auth state refresh

### Payment Integration

Stripe handles all transactions:
- `@stripe/stripe-js` for client-side
- `stripe` Node.js SDK for server-side
- Payment intents stored in `purchases` table

### Studio Visualizer Architecture

The Studio uses Three.js for real-time 3D visualization of light sequences:

**Key Features:**
- Instanced rendering for performance (supports 100k+ LEDs)
- Adaptive quality based on device capabilities
- Grid, axes, and bounds visualization helpers
- Camera controls with state management
- Model click/hover interactions

**Location:** `src/lib/studio/visualizer.ts`

**Dependencies:**
- `three`: Core 3D rendering
- `troika-three-text`: High-quality text rendering
- `essentia.js` & `meyda`: Audio analysis for beat detection
- `@xenova/transformers`: AI model inference (browser-based)
- `fast-xml-parser`: Parse xLights XML files

## Environment Configuration

Copy `.env.local.example` to `.env.local` and configure:

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role (server-only)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe public key
- `STRIPE_SECRET_KEY`: Stripe secret key (server-only)

**Optional Variables:**
- `NEXT_PUBLIC_MAX_FILE_SIZE`: Max upload size (default: 50MB)
- `NEXT_PUBLIC_ALLOWED_FILE_TYPES`: File type whitelist (`.fseq,.xsq`)

## Key Design Patterns

### File Path Aliases

TypeScript is configured with `@/*` alias pointing to `src/*`:
```typescript
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
```

### Component Architecture

**UI Components:** Reusable, presentation-only components in `src/components/ui/`
- Accept `className` prop for Tailwind customization
- Use `class-variance-authority` for variant management

**Feature Components:** Domain-specific components (marketplace, auth, etc.)
- Can use hooks and context
- Handle business logic

### Server vs Client Components

Next.js 15 defaults to Server Components. Mark client components with `'use client'` directive when:
- Using React hooks (useState, useEffect, etc.)
- Adding event handlers
- Using browser-only APIs
- Accessing Supabase client-side

### Data Fetching

**Server Components:**
```typescript
import { createClient } from '@/lib/supabase/server'

async function getSequences() {
  const supabase = createClient()
  const { data } = await supabase.from('sequences').select('*')
  return data
}
```

**Client Components:**
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
// Use with useEffect or React Query
```

## Common Workflows

### Adding a New Database Table

1. Create migration: `npx supabase migration new add_table_name`
2. Edit migration file in `supabase/migrations/`
3. Apply locally: `npx supabase db reset` (or start if not running)
4. Regenerate types: `npx supabase gen types typescript --local > src/types/database.ts`
5. Update `src/types/database.ts` interface if needed
6. Push to production: `npx supabase db push`

### Creating New Marketplace Features

**Sequence Card Pattern:**
- Component: `src/components/marketplace/SequenceCard.tsx`
- Shows: thumbnail, title, price, rating, sales count
- Hover effects: `hover-glow-primary` class
- Links to detail page or purchase flow

**Filtering/Search:**
- Consider server-side filtering via Supabase queries
- Use URL params for shareable filter states
- Implement in browse/marketplace pages

### Integrating Stripe Payments

**Server-Side Flow:**
1. Create Payment Intent (API route with Stripe SDK)
2. Return `client_secret` to frontend
3. Confirm payment with Stripe Elements
4. Webhook handler creates `purchases` record
5. Trigger sequence file delivery

**Key Security:**
- Never expose `STRIPE_SECRET_KEY` to client
- Validate webhook signatures
- Use Stripe's test mode during development

## Important Considerations

### File Uploads for Sequences

xLights sequences are binary files (`.fseq`, `.xsq`). Use Supabase Storage:
- Bucket: Create `sequences` bucket with RLS policies
- Upload: Use Supabase client `storage.from('sequences').upload()`
- Access: Generate signed URLs for purchased sequences only

### Performance Optimization

**Studio Visualizer:**
- Large sequences (100k+ LEDs) require instanced rendering
- Implement LOD (Level of Detail) for distant models
- Use Web Workers for audio analysis (Comlink for easy threading)

**Marketplace:**
- Lazy load sequence thumbnails
- Implement pagination or infinite scroll
- Cache frequently accessed sequences

### Type Safety

The project uses strict TypeScript. Always:
- Use generated database types from `src/types/database.ts`
- Avoid `any` types
- Properly type API responses and component props

### Version Compatibility Notes

- **Next.js 15.5.2**: Uses Turbopack by default (faster dev server)
- **React 19.1.0**: Latest React features enabled
- **Supabase SSR**: Must use `@supabase/ssr` for Next.js App Router
- **Tailwind 4.0**: Updated syntax, check docs for breaking changes

## Testing & Debugging

### Local Development Stack

1. Start Supabase: `npx supabase start`
2. Start Next.js: `npm run dev`
3. Access:
   - App: `http://localhost:3000`
   - Supabase Studio: `http://127.0.0.1:54323`

### Database Debugging

Use Supabase Studio UI to:
- Browse tables and data
- Run SQL queries
- Test RLS policies
- View real-time logs

### Common Issues

**Supabase client errors:**
- Ensure environment variables are set
- Check if local Supabase is running
- Verify table/column names match database schema

**Build errors:**
- Run `npx tsc` to check TypeScript errors
- Ensure imports use `@/*` alias correctly
- Check for missing environment variables in production

## Project-Specific Terminology

- **Sequence**: An xLights animation file (music + light effects)
- **Props**: Physical light elements (mega trees, arches, etc.)
- **FSEQ/XSQ**: File formats for sequences
- **Channels**: Individual light control points
- **Creator**: User who sells sequences
- **Buyer**: User who purchases sequences
- **Studio**: AI-powered sequence creation tool
