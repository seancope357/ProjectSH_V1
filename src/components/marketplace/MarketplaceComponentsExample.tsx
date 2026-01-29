'use client'

/**
 * Marketplace Components Usage Examples
 *
 * This file demonstrates how to use the foundational marketplace UI components
 * that have been optimized for dual-sided marketplace success (sellers + customers).
 *
 * Components included:
 * 1. TrustBar - Display marketplace statistics
 * 2. StatsCounter - Animated number counter
 * 3. BenefitPillar - Feature/benefit display with icons
 * 4. BadgeIcon - Status badges for products
 */

import React from 'react'
import TrustBar from './TrustBar'
import StatsCounter from '@/components/ui/StatsCounter'
import BenefitPillar from '@/components/ui/BenefitPillar'
import BadgeIcon, { BadgeOverlay } from '@/components/ui/BadgeIcon'
import {
  Users,
  Download,
  Star,
  ShoppingBag,
  Zap,
  Shield,
  Clock,
  Globe,
} from 'lucide-react'

const MarketplaceComponentsExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8 space-y-16">
      {/* Section 1: TrustBar Examples */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">TrustBar Component</h2>
        <p className="text-text-secondary text-center max-w-2xl mx-auto">
          Build trust with marketplace statistics. Use at top of pages to establish credibility.
        </p>

        {/* Example 1: Glassmorphism variant (default) */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-text-secondary">Variant: Glassmorphism</h3>
          <TrustBar
            stats={[
              {
                label: 'Active Sellers',
                value: 2847,
                icon: Users,
                suffix: '+',
              },
              {
                label: 'Total Downloads',
                value: 156000,
                icon: Download,
                suffix: 'K',
              },
              {
                label: 'Average Rating',
                value: 4.8,
                icon: Star,
                decimals: 1,
              },
              {
                label: 'Total Sales',
                value: 389000,
                icon: ShoppingBag,
                prefix: '$',
                suffix: 'K',
              },
            ]}
          />
        </div>

        {/* Example 2: Solid variant */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-text-secondary">Variant: Solid</h3>
          <TrustBar
            variant="solid"
            stats={[
              {
                label: 'Sequences Sold',
                value: 45000,
                icon: ShoppingBag,
                suffix: '+',
              },
              {
                label: 'Happy Customers',
                value: 12000,
                icon: Users,
                suffix: 'K',
              },
            ]}
          />
        </div>
      </section>

      {/* Section 2: StatsCounter Examples */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">StatsCounter Component</h2>
        <p className="text-text-secondary text-center max-w-2xl mx-auto">
          Standalone animated counters with scroll trigger. Use for impactful statistics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <StatsCounter
            targetValue={25000}
            label="Total Sequences"
            suffix="+"
            duration={2.5}
          />
          <StatsCounter
            targetValue={98.5}
            label="Customer Satisfaction"
            suffix="%"
            decimals={1}
            duration={2}
          />
          <StatsCounter
            targetValue={1500000}
            label="Revenue Generated"
            prefix="$"
            duration={3}
          />
        </div>
      </section>

      {/* Section 3: BenefitPillar Examples */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">BenefitPillar Component</h2>
        <p className="text-text-secondary text-center max-w-2xl mx-auto">
          Display features and benefits with icons. Perfect for "Why Choose Us" sections.
        </p>

        {/* Example 1: Feature grid for customers */}
        <div>
          <h3 className="text-xl font-semibold mb-6 text-text-secondary text-center">
            Customer Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <BenefitPillar
              icon={Zap}
              title="Instant Download"
              description="Get your sequences immediately after purchase. No waiting, no delays."
              accent="primary"
            />
            <BenefitPillar
              icon={Shield}
              title="Quality Guaranteed"
              description="Every sequence is reviewed and tested. 30-day money-back guarantee."
              accent="secondary"
            />
            <BenefitPillar
              icon={Clock}
              title="Lifetime Updates"
              description="Get free updates forever. Your purchase never expires."
              accent="accent"
            />
          </div>
        </div>

        {/* Example 2: Feature grid for sellers with stats */}
        <div>
          <h3 className="text-xl font-semibold mb-6 text-text-secondary text-center">
            Seller Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <BenefitPillar
              icon={Users}
              title="Global Reach"
              description="Access thousands of buyers worldwide. Expand your customer base instantly."
              stat="150+ countries"
              accent="primary"
            />
            <BenefitPillar
              icon={ShoppingBag}
              title="High Conversion"
              description="Optimized marketplace with proven conversion rates. More sales, less effort."
              stat="12% avg CVR"
              accent="accent"
            />
          </div>
        </div>
      </section>

      {/* Section 4: BadgeIcon Examples */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">BadgeIcon Component</h2>
        <p className="text-text-secondary text-center max-w-2xl mx-auto">
          Status badges for products. Use to highlight trending, new, bestselling, or featured items.
        </p>

        {/* Badge types showcase */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-text-secondary">Badge Types</h3>
            <div className="flex flex-wrap gap-4 items-center justify-center">
              <BadgeIcon type="trending" size="lg" />
              <BadgeIcon type="new" size="lg" />
              <BadgeIcon type="bestseller" size="lg" />
              <BadgeIcon type="featured" size="lg" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-text-secondary">Badge Sizes</h3>
            <div className="flex flex-wrap gap-4 items-center justify-center">
              <BadgeIcon type="trending" size="sm" />
              <BadgeIcon type="trending" size="md" />
              <BadgeIcon type="trending" size="lg" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-text-secondary">
              Badge on Product Card (Demo)
            </h3>
            <div className="max-w-sm mx-auto">
              {/* Mock product card */}
              <div className="relative bg-surface/50 rounded-2xl p-6 border border-white/10">
                {/* Badge overlay - top right corner */}
                <BadgeOverlay type="bestseller" position="top-right" size="md" />

                {/* Mock product content */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl mb-4" />
                <h4 className="text-lg font-bold mb-2">Christmas Mega Tree Sequence</h4>
                <p className="text-text-secondary text-sm mb-4">
                  Professional holiday sequence with 50+ effects
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-accent">$49.99</span>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Combined Example */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Combined Example</h2>
        <p className="text-text-secondary text-center max-w-2xl mx-auto">
          All components working together in a typical marketplace landing section
        </p>

        <div className="max-w-6xl mx-auto space-y-12">
          {/* Trust stats at the top */}
          <TrustBar
            variant="glassmorphism"
            stats={[
              { label: 'Active Creators', value: 5000, icon: Users, suffix: '+' },
              { label: 'Sequences Available', value: 25000, icon: ShoppingBag, suffix: '+' },
              { label: 'Total Downloads', value: 500000, icon: Download, suffix: 'K' },
              { label: 'Avg Rating', value: 4.9, icon: Star, decimals: 1 },
            ]}
          />

          {/* Feature benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BenefitPillar
              icon={Globe}
              title="Global Marketplace"
              description="Connect with creators and buyers from 150+ countries"
              accent="primary"
            />
            <BenefitPillar
              icon={Shield}
              title="Secure Transactions"
              description="Bank-level security with instant, automated delivery"
              accent="secondary"
            />
            <BenefitPillar
              icon={Zap}
              title="Lightning Fast"
              description="Download your sequences instantly after purchase"
              accent="accent"
            />
          </div>
        </div>
      </section>

      {/* Usage Documentation */}
      <section className="max-w-4xl mx-auto space-y-6 bg-surface/30 rounded-2xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold">Component Usage Guide</h2>

        <div className="space-y-4 text-text-secondary">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">TrustBar</h3>
            <p className="mb-2">Display marketplace statistics with animated counters:</p>
            <code className="block bg-background p-4 rounded-lg text-sm overflow-x-auto">
              {`<TrustBar
  variant="glassmorphism" // or "solid" or "minimal"
  stats={[
    { label: 'Users', value: 10000, icon: Users, suffix: '+' }
  ]}
/>`}
            </code>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">StatsCounter</h3>
            <p className="mb-2">Standalone animated counter with scroll trigger:</p>
            <code className="block bg-background p-4 rounded-lg text-sm overflow-x-auto">
              {`<StatsCounter
  targetValue={1000}
  label="Happy Customers"
  duration={2}
  prefix="$"
  suffix="K"
  decimals={1}
/>`}
            </code>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">BenefitPillar</h3>
            <p className="mb-2">Display features with icon, title, description, and optional stat:</p>
            <code className="block bg-background p-4 rounded-lg text-sm overflow-x-auto">
              {`<BenefitPillar
  icon={Zap}
  title="Fast Delivery"
  description="Instant downloads"
  stat="< 1 sec"
  accent="primary" // or "secondary" or "accent"
/>`}
            </code>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">BadgeIcon</h3>
            <p className="mb-2">Status badges for product cards:</p>
            <code className="block bg-background p-4 rounded-lg text-sm overflow-x-auto">
              {`<BadgeIcon
  type="trending" // or "new", "bestseller", "featured"
  size="md" // or "sm", "lg"
/>

// Or use as overlay on cards:
<BadgeOverlay
  type="bestseller"
  position="top-right"
  size="md"
/>`}
            </code>
          </div>
        </div>
      </section>
    </div>
  )
}

export default MarketplaceComponentsExample
