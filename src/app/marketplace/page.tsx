'use client'
import React from 'react'
import Layout from '@/components/layout/Layout'
import SequenceCard, { type Sequence } from '@/components/marketplace/SequenceCard'
import Button from '@/components/ui/Button'
import { SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'

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
        {/* Quick search removed */}
      </div>
    </div>
  </section>
)

const FilterBar: React.FC<{ sequences: Sequence[] }> = ({ sequences }) => (
  <div className="border-b border-white/5 mb-8 mt-8">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-heading font-semibold text-white">Featured Sequences</h2>
          <span className="text-sm text-gray-400">({sequences.length} results)</span>
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

export default function MarketplacePage() {
  const [sequences, setSequences] = useState<Sequence[]>([])

  useEffect(() => {
    const generatedSequences: Sequence[] = Array.from({ length: 12 }).map((_, i) => ({
      id: String(i + 1),
      title: [
        'Christmas Magic Spectacular',
        'Halloween Haunted House',
        'Winter Wonderland Dreams',
        'Summer Festival Lights',
        'Easter Celebration Joy',
        'Fourth of July Fireworks',
        'Autumn Harvest Display',
        "Valentine's Day Romance",
        "St. Patrick's Day Green",
        'Thanksgiving Gratitude',
        "New Year's Eve Countdown",
        'Spring Awakening Bloom'
      ][i],
      price: 15 + (i * 5) + Math.random() * 20,
      image: `https://images.unsplash.com/photo-${1545558014}-8692c3eb5c50?q=80&w=800&auto=format&fit=crop`,
      badge: i % 4 === 0 ? 'Hot' : i % 5 === 0 ? 'New' : i % 7 === 0 ? 'Featured' : undefined,
      rating: 4 + Math.random(),
      seller: [
        'LightMaster Pro',
        'Holiday Creator',
        'Sequence Expert',
        'Display Wizard',
        'Festive Lights Co'
      ][i % 5],
      downloads: Math.floor(Math.random() * 5000) + 100,
      duration: `${Math.floor(Math.random() * 8) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      props: [
        ['RGB Lights', 'Pixel Strips', 'Matrix'],
        ['Spotlights', 'Floods', 'Laser'],
        ['DMX Controllers', 'Smart Plugs'],
        ['Inflatables', 'Props', 'Signs'],
        ['Music Sync', 'Voice Control']
      ][Math.floor(Math.random() * 5)]
    }))
    setSequences(generatedSequences)
  }, [])

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <Hero />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <FilterBar sequences={sequences} />
          <SequenceGrid sequences={sequences} />

          {/* Load More */}
          <div className="text-center py-8">
            <Button variant="solid" accent="secondary">Load More</Button>
          </div>
        </main>
      </div>
    </Layout>
  )
}