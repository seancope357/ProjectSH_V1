'use client'

import React, { useState } from 'react'
import CountdownTimer from '@/components/ui/CountdownTimer'
import StickySellerCTA from '@/components/seller/StickySellerCTA'
import LiveActivityIndicator from '@/components/marketplace/LiveActivityIndicator'
import BuyerToSellerCard from '@/components/marketplace/BuyerToSellerCard'
import SequenceCard, { Sequence } from '@/components/marketplace/SequenceCard'

// Mock data for demonstration
const mockSequences: Sequence[] = [
  {
    id: '1',
    title: 'Winter Wonderland Mega Tree Spectacular',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800',
    badge: 'Best Seller',
    rating: 4.8,
    seller: 'LightMaster3000',
    downloads: 1247,
    duration: '4:32',
    props: ['Mega Tree', 'Arches', 'Matrix'],
  },
  {
    id: '2',
    title: 'Classic Christmas Carol Collection',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800',
    rating: 4.9,
    seller: 'HolidayPro',
    downloads: 2156,
    duration: '3:45',
    props: ['House Outline', 'Trees', 'Windows'],
  },
  {
    id: '3',
    title: 'Modern EDM Holiday Mashup',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800',
    badge: 'New',
    rating: 4.7,
    seller: 'NeonNights',
    downloads: 834,
    duration: '5:12',
    props: ['RGB Floods', 'Pixel Tree', 'Strobes'],
  },
  {
    id: '4',
    title: 'Traditional Nativity Scene Sequence',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800',
    rating: 5.0,
    seller: 'FaithLights',
    downloads: 456,
    duration: '6:30',
    props: ['Nativity', 'Stars', 'Angels'],
  },
  {
    id: '5',
    title: 'Rock & Roll Christmas Extravaganza',
    price: 44.99,
    image: 'https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=800',
    badge: 'Trending',
    rating: 4.6,
    seller: 'RockStarLights',
    downloads: 1089,
    duration: '4:15',
    props: ['Guitar Shape', 'Music Notes', 'Lasers'],
  },
  {
    id: '6',
    title: 'Frozen Theme Ice Castle Show',
    price: 54.99,
    image: 'https://images.unsplash.com/photo-1544273677-89c2e03c3e3e?w=800',
    rating: 4.9,
    seller: 'DisneyFanatic',
    downloads: 1678,
    duration: '3:52',
    props: ['Ice Castle', 'Snowflakes', 'Blue LED'],
  },
]

export default function PsychologicalTriggersDemo() {
  const [timerExpired, setTimerExpired] = useState(false)

  // Set countdown to 2 hours from now for demo
  const countdownEnd = new Date(Date.now() + 2 * 60 * 60 * 1000)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Sticky Seller CTA - appears after 800px scroll */}
      <StickySellerCTA
        ctaText="Start Selling Today"
        href="/become-seller"
        showAfterScroll={800}
        dismissible={true}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Psychological Trigger Components Demo
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Four conversion-optimized components that increase urgency, scarcity, and
            FOMO based on research showing these tactics increase conversions by up to
            332%
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-400">Scroll down to see all components in action</span>
          </div>
        </div>
      </div>

      {/* Component 1: Countdown Timer */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">1. Countdown Timer</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Creates urgency with time-limited promotions. Color changes based on time
              remaining to increase psychological pressure.
            </p>
            <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <span className="text-cyan-400 font-semibold">
                Psychological Trigger: URGENCY (332% conversion increase)
              </span>
            </div>
          </div>

          <CountdownTimer
            endDate={countdownEnd}
            urgencyMessage="Flash Sale Ends In"
            onExpire={() => {
              setTimerExpired(true)
              alert('Timer expired! This is where you would update UI or redirect.')
            }}
            className="max-w-3xl mx-auto"
          />

          {timerExpired && (
            <div className="mt-6 text-center">
              <p className="text-green-400 font-semibold">
                Expiration callback triggered! Check console.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Component 3: Live Activity Indicators */}
      <section className="py-16 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">3. Live Activity Indicators</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Show real-time marketplace activity to create social proof and FOMO.
              Different types for viewing, purchases, and downloads.
            </p>
            <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
              <span className="text-green-400 font-semibold">
                Psychological Trigger: SOCIAL PROOF + FOMO (95% of decisions are
                subconscious)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-center">Viewing Activity</h3>
              <div className="flex justify-center">
                <LiveActivityIndicator
                  activityType="viewing"
                  count={23}
                  showPulse={true}
                />
              </div>
              <p className="text-xs text-gray-400 text-center mt-4">
                Shows real-time viewers with pulse effect
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-center">Purchase Activity</h3>
              <div className="flex justify-center">
                <LiveActivityIndicator
                  activityType="purchased"
                  count={47}
                  itemName="this sequence"
                  showPulse={false}
                />
              </div>
              <p className="text-xs text-gray-400 text-center mt-4">
                Validates quality with purchase count
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-center">Download Count</h3>
              <div className="flex justify-center">
                <LiveActivityIndicator
                  activityType="downloaded"
                  count={1247}
                  showPulse={false}
                />
              </div>
              <p className="text-xs text-gray-400 text-center mt-4">
                Shows popularity metric
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Grid with Live Indicators */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Live Indicators on Sequence Cards</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              See how activity indicators overlay on actual sequence cards to create
              urgency and social proof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockSequences.slice(0, 6).map((seq, index) => (
              <div key={seq.id} className="relative">
                <SequenceCard sequence={seq} />

                {/* Add live activity indicators to some cards */}
                {index % 2 === 0 && (
                  <LiveActivityIndicator
                    activityType="viewing"
                    count={Math.floor(Math.random() * 20) + 5}
                    position="absolute"
                    className="top-4 left-4 z-10"
                    showPulse={true}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Component 4: Buyer to Seller Conversion Card */}
      <section className="py-16 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">4. Buyer to Seller Conversion Card</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Strategic conversion card inserted between sequences to convert buyers
              into sellers. Takes up 2 grid slots and stands out with accent gold theme.
            </p>
            <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <span className="text-amber-400 font-semibold">
                Psychological Trigger: STRATEGIC CONVERSION TOUCHPOINT
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Show first 3 sequences */}
            {mockSequences.slice(0, 3).map((seq) => (
              <SequenceCard key={seq.id} sequence={seq} />
            ))}

            {/* Insert conversion card (takes 2 slots) */}
            <BuyerToSellerCard />

            {/* Show remaining sequences */}
            {mockSequences.slice(3, 6).map((seq) => (
              <SequenceCard key={seq.id} sequence={seq} />
            ))}
          </div>

          <div className="mt-10 p-6 bg-gray-800/50 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold mb-3">Implementation Note</h3>
            <p className="text-gray-400 text-sm">
              In production, insert this card every 12-15 sequences in the browse grid.
              It stands out visually while maintaining the grid flow. The card is
              self-contained with no props needed, making it easy to drop in anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Component 2: Sticky Seller CTA */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">2. Sticky Seller CTA</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Persistent CTA bar that appears after user scrolls 800px (proving
              engagement). Dismissible with localStorage to prevent fatigue.
            </p>
            <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <span className="text-purple-400 font-semibold">
                Psychological Trigger: PERSISTENT TOUCHPOINTS (121% higher CTR)
              </span>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-8 border border-white/10">
            <h3 className="text-xl font-semibold mb-4">How It Works</h3>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex-shrink-0 mt-1">
                  1
                </div>
                <div>
                  <p className="font-semibold mb-1">Scroll Trigger</p>
                  <p className="text-sm text-gray-400">
                    The sticky bar appears when you scroll past 800px (configurable).
                    This proves user engagement before showing the CTA.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold flex-shrink-0 mt-1">
                  2
                </div>
                <div>
                  <p className="font-semibold mb-1">Smooth Animation</p>
                  <p className="text-sm text-gray-400">
                    Slides in from the top with a spring animation. Fixed position
                    keeps it visible as you continue scrolling.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 font-bold flex-shrink-0 mt-1">
                  3
                </div>
                <div>
                  <p className="font-semibold mb-1">Dismissible & Smart</p>
                  <p className="text-sm text-gray-400">
                    Users can dismiss with the X button. Dismissal is stored in
                    localStorage with a 7-day cooldown to prevent fatigue.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex-shrink-0 mt-1">
                  4
                </div>
                <div>
                  <p className="font-semibold mb-1">Analytics Ready</p>
                  <p className="text-sm text-gray-400">
                    Logs impressions, clicks, and dismissals to console (ready for
                    your analytics provider). Check browser console to see events.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <p className="text-cyan-400 text-sm font-semibold mb-2">
                Try it out!
              </p>
              <p className="text-gray-300 text-sm">
                The sticky CTA is active on this page. If you haven't seen it yet,
                scroll up to the top and then back down. It will appear after you pass
                800px of scroll depth. Look at the top of the viewport!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Summary and Best Practices */}
      <section className="py-16 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Best Practices & Placement</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Strategic placement maximizes conversion impact while maintaining user
              experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-cyan-400">CountdownTimer</span>
              </h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>
                    <strong>Product pages:</strong> Above purchase button to drive
                    immediate action
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>
                    <strong>Checkout:</strong> Near payment to reduce cart abandonment
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>
                    <strong>Homepage hero:</strong> For site-wide flash sales
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-purple-400">StickySellerCTA</span>
              </h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>
                    <strong>Browse pages:</strong> Primary use case for buyer-to-seller
                    conversion
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>
                    <strong>Sequence details:</strong> "See how much YOUR sequence
                    could earn"
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>
                    <strong>Post-purchase:</strong> High satisfaction moment to
                    introduce selling
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-green-400">LiveActivityIndicator</span>
              </h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>
                    <strong>Card overlays:</strong> Top-left absolute positioning with
                    z-index
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>
                    <strong>Detail pages:</strong> Multiple indicators (viewing,
                    purchased, downloads)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>
                    <strong>Inline stats:</strong> Integrate with existing metadata
                    display
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-amber-400">BuyerToSellerCard</span>
              </h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>
                    <strong>Grid placement:</strong> Insert every 12-15 sequences in
                    marketplace
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>
                    <strong>Engagement-based:</strong> Show after user views 5+
                    sequences
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>
                    <strong>Personalized:</strong> Target users with 2+ purchases who
                    aren't sellers
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Link */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Full Implementation Guide</h2>
          <p className="text-gray-400 mb-6">
            See detailed documentation, code examples, psychological principles, and A/B
            testing recommendations in the comprehensive guide.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
            <span className="text-cyan-400 font-mono text-sm">
              /PSYCHOLOGICAL_TRIGGERS_GUIDE.md
            </span>
          </div>
        </div>
      </section>

      {/* Spacer for scroll testing */}
      <div className="h-96" />
    </div>
  )
}
