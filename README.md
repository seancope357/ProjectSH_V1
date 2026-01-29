# SequenceHUB

> **The xLights Sequence Marketplace** - Discover, purchase, and sell premium xLights sequences from creators worldwide.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Latest-blueviolet)](https://stripe.com/)

## Overview

SequenceHUB is a full-stack marketplace platform that connects xLights sequence creators with buyers. The platform features:

- 🛒 **Marketplace** - Browse and purchase premium xLights sequences
- 🎨 **Studio** - AI-powered sequence creation tool with 3D visualization
- 💰 **Creator Platform** - Sell sequences with automated payment processing and delivery
- 🔐 **Secure Authentication** - Powered by Supabase Auth
- 💳 **Payment Processing** - Integrated Stripe checkout and webhooks
- 📊 **Seller Dashboard** - Manage sequences, track sales, and view analytics

## Tech Stack

### Frontend
- **Next.js 15.5.2** - React framework with App Router and Turbopack
- **React 19.1.0** - UI library
- **TypeScript 5.x** - Type safety
- **Tailwind CSS 4.0** - Utility-first styling with custom design system
- **Framer Motion** - Animations
- **Lucide React** - Icon library

### Backend & Services
- **Supabase** - PostgreSQL database, authentication, and storage
- **Stripe** - Payment processing
- **Three.js** - 3D visualization engine for sequence studio

### AI & Audio
- **@xenova/transformers** - Browser-based AI model inference
- **essentia.js & meyda** - Audio analysis for beat detection

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account ([supabase.com](https://supabase.com))
- Stripe account ([stripe.com](https://stripe.com))
- Supabase CLI (optional, for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SequenceHUB_V1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your environment variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=SequenceHub
   ```

4. **Set up Supabase database**

   **Option A: Remote Supabase Project**
   - Create a new project on [supabase.com](https://supabase.com)
   - Run migrations from `supabase/migrations/` in the SQL Editor
   - Create storage buckets: `profiles`, `sequences`
   - Configure RLS policies for buckets

   **Option B: Local Supabase (Recommended for Development)**
   ```bash
   # Start local Supabase instance
   npx supabase start

   # Migrations will run automatically
   # Access local Supabase Studio at http://127.0.0.1:54323
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Available Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint

# Supabase (Local Development)
npx supabase start   # Start local Supabase instance
npx supabase stop    # Stop local Supabase instance
npx supabase db reset # Reset database (WARNING: destroys data)
npx supabase migration new <name> # Create new migration
npx supabase gen types typescript --local > src/types/database.ts # Generate types
npx supabase db push # Push migrations to remote
```

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── browse/            # Marketplace browse page
│   ├── marketplace/       # Marketplace views
│   ├── studio/            # AI sequence creation studio
│   ├── seller-dashboard/  # Seller management interface
│   └── api/               # API routes (if any)
├── components/
│   ├── auth/             # Authentication components
│   ├── cart/             # Shopping cart
│   ├── dashboard/        # Dashboard components
│   ├── layout/           # Layout (Navigation, Sidebar)
│   ├── marketplace/      # Marketplace components (SequenceCard)
│   └── ui/               # Reusable UI primitives
├── lib/
│   ├── supabase/         # Supabase client configs
│   ├── studio/           # Studio utilities (visualizer)
│   └── utils.ts          # General utilities
├── types/
│   ├── database.ts       # Generated Supabase types
│   └── studio.ts         # Studio/visualizer types
├── contexts/             # React contexts
└── hooks/                # Custom React hooks

supabase/
├── migrations/           # Database migration files
└── config.toml          # Local Supabase configuration
```

### Key Technologies & Patterns

#### Authentication
Uses Supabase Auth with SSR support:
- Server Components: `createClient()` from `@/lib/supabase/server`
- Client Components: `createClient()` from `@/lib/supabase/client`
- Middleware handles auth state refresh

#### Database
PostgreSQL via Supabase with key tables:
- `profiles` - User profiles and seller status
- `sequences` - Sequence listings with metadata
- `purchases` - Transaction records
- Migrations in `supabase/migrations/`

#### File Storage
Supabase Storage buckets:
- `profiles` - User profile pictures
- `sequences` - Sequence files and thumbnails
- Helper: `uploadImage()` in `src/lib/supabase/storage.ts`

#### Payments
Stripe integration:
- Client: `@stripe/stripe-js` and `@stripe/react-stripe-js`
- Server: `stripe` Node.js SDK
- Webhooks handle payment confirmations

#### 3D Studio
Three.js visualizer (`src/lib/studio/visualizer.ts`):
- Instanced rendering for 100k+ LEDs
- Adaptive quality based on device
- Audio analysis integration

## Database Schema

### Core Tables

**profiles**
```sql
- id: uuid (PK, references auth.users)
- email: text
- full_name: text
- is_seller: boolean
- profile_picture_url: text
- created_at: timestamp
```

**sequences**
```sql
- id: uuid (PK)
- seller_id: uuid (FK -> profiles.id)
- title: text
- description: text
- price: numeric
- thumbnail_url: text
- file_url: text
- downloads: integer
- rating: numeric
- created_at: timestamp
```

**purchases**
```sql
- id: uuid (PK)
- buyer_id: uuid (FK -> profiles.id)
- sequence_id: uuid (FK -> sequences.id)
- stripe_payment_intent_id: text
- amount: numeric
- purchased_at: timestamp
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.local`
4. Deploy

### Environment Variables for Production

Ensure all variables from `.env.local.example` are set in your hosting platform, especially:
- Supabase production credentials
- Stripe production keys
- `NEXT_PUBLIC_APP_URL` set to your domain

### Post-Deployment

1. Run database migrations on production Supabase
2. Set up Stripe webhooks pointing to `https://yourdomain.com/api/webhooks/stripe`
3. Configure CORS and RLS policies in Supabase
4. Test payment flow end-to-end

## Features

### For Buyers
- Browse marketplace with filtering and search
- Preview sequence details and ratings
- Secure checkout with Stripe
- Instant download access after purchase
- Order history and re-downloads

### For Sellers
- Upload and manage sequences
- Set pricing and descriptions
- Track sales and analytics
- Automated payment processing
- Profile customization

### Studio (AI-Powered)
- 3D visualization of light sequences
- Support for 100k+ LED elements
- Real-time audio analysis
- Beat detection and synchronization
- Export to xLights formats (.fseq, .xsq)

## File Formats

SequenceHUB supports standard xLights file formats:
- `.fseq` - Falcon Player Sequence (binary)
- `.xsq` - xLights Sequence (XML)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:
- Check existing documentation in `CLAUDE.md`
- Review [Supabase docs](https://supabase.com/docs)
- Review [Next.js docs](https://nextjs.org/docs)
- Open an issue in the repository

## Acknowledgments

- [xLights](https://xlights.org/) - The lighting sequencing software this marketplace supports
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Stripe](https://stripe.com/) - Payment processing
- [Vercel](https://vercel.com/) - Hosting and deployment
