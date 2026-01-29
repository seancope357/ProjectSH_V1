'use client'

import React from 'react'
import Layout from '@/components/layout/Layout'
import SequenceCard, { type Sequence } from '@/components/marketplace/SequenceCard'
import Button from '@/components/ui/Button'
import { SlidersHorizontal, Search } from 'lucide-react'

// Sample data - replace with actual data from Supabase
const sampleSequences: Sequence[] = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  title: [
    'Christmas Magic Spectacular',
    'Halloween Haunted House', 
    'Winter Wonderland Dreams',
    'Summer Festival Lights',
    'Easter Celebration Joy',
    'Fourth of July Fireworks',
    'Autumn Harvest Display',
    'Valentine\'s Day Romance',
    'St. Patrick\'s Day Green',
    'Thanksgiving Gratitude',
    'New Year\'s Eve Countdown',
    'Spring Awakening Bloom'
  ][i],
  price: [
    29.99, 24.99, 34.99, 19.99, 39.99,
    44.99, 27.99, 22.99, 32.99, 49.99,
    17.99, 37.99
  ][i],
  image: 'https://images.unsplash.com/photo-1545558014-8692c3eb5c50?q=80&w=800&auto=format&fit=crop',
  badge: i % 4 === 0 ? 'Hot' : i % 5 === 0 ? 'New' : i % 7 === 0 ? 'Featured' : undefined,
  rating: [
    4.8, 4.5, 4.9, 4.7, 4.6,
    4.3, 4.7, 4.8, 4.4, 4.9,
    4.5, 4.6
  ][i],
  seller: [
    'LightMaster Pro',
    'Holiday Creator', 
    'Sequence Expert',
    'Display Wizard',
    'Festive Lights Co'
  ][i % 5],
  downloads: [
    2847, 1923, 3542, 1256, 4721,
    3198, 2456, 1875, 3087, 5124,
    1532, 2976
  ][i],
  // Use fixed durations instead of random ones to avoid hydration errors
  duration: [
    '3:45', '4:20', '2:55', '5:10', '3:30', 
    '4:15', '2:45', '3:20', '4:50', '5:25', 
    '3:15', '4:30'
  ][i],
  props: [
    ['RGB Lights', 'Pixel Strips', 'Matrix'],
    ['Spotlights', 'Floods', 'Laser'],
    ['DMX Controllers', 'Smart Plugs'],
    ['Inflatables', 'Props', 'Signs'],
    ['Music Sync', 'Voice Control'],
    ['RGB Lights', 'Pixel Strips', 'Matrix'],
    ['Spotlights', 'Floods', 'Laser'],
    ['DMX Controllers', 'Smart Plugs'],
    ['Inflatables', 'Props', 'Signs'],
    ['Music Sync', 'Voice Control'],
    ['RGB Lights', 'Pixel Strips', 'Matrix'],
    ['Spotlights', 'Floods', 'Laser']
  ][i]
}))

const Hero: React.FC = () => (
  <section className="relative">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,229,255,0.08),transparent_60%)]" aria-hidden />
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-white">
            Discover Premium <span className="text-primary">xLights</span> Sequences
          </h1>
          <p className="text-gray-300 max-w-2xl text-lg">
            Browse our curated collection of professional xLights sequences from top creators worldwide.
            Perfect for residential and commercial displays.
          </p>
          <div className="flex items-center gap-3">
            <Button size="lg">Explore All</Button>
            <Button variant="soft" size="lg" accent="secondary">Upload Your Own</Button>
          </div>
        </div>
        <div className="w-full lg:w-[420px] rounded-2xl border border-white/5 bg-surface/60 p-5 shadow-lg shadow-black/30 [box-shadow:0_0_0_1px_rgba(255,255,255,0.06),0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div className="text-sm text-gray-300 mb-3">Quick search</div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                className="w-full rounded-full bg-background/60 border border-white/10 px-4 h-11 text-sm text-white placeholder-gray-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Search by name, creator, or props..."
                type="text"
              />
            </div>
            <Button>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
)

const FilterBar: React.FC = () => (
  <div className="border-b border-white/5 mb-8">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-heading font-semibold text-white">Featured Sequences</h2>
          <span className="text-sm text-gray-400">({sampleSequences.length} results)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">Newest</Button>
            <Button variant="ghost" size="sm">Popular</Button>
            <Button variant="ghost" size="sm">Price: Low</Button>
            <Button variant="ghost" size="sm">Price: High</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const SequenceGrid: React.FC<{ sequences: Sequence[] }> = ({ sequences }) => {
  const handleAddToCart = (sequence: Sequence) => {
    console.log('Adding to cart:', sequence.title)
    // Implement cart functionality
  }

  const handleToggleFavorite = (sequence: Sequence) => {
    console.log('Toggling favorite:', sequence.title)
    // Implement favorites functionality
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sequences.map((sequence) => (
        <SequenceCard
          key={sequence.id}
          sequence={sequence}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
        />
      ))}
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <Hero />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
          <FilterBar />
          <SequenceGrid sequences={sampleSequences} />
          
          {/* Load More */}
          <div className="flex justify-center mt-12">
            <Button variant="outline" size="lg">
              Load More Sequences
            </Button>
          </div>
        </main>
      </div>
    </Layout>
  )
}
