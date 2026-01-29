import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import { Star } from 'lucide-react'
import SequenceCard from '@/components/marketplace/SequenceCard'
import Input from '@/components/ui/Input'
import { getSequences } from '@/components/supabase-data-fetcher'

export default async function Home() {
  const displayedSequences = await getSequences()

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-background via-surface to-background overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 animate-gradient-shift"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 py-16">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold leading-tight mb-6 drop-shadow-lg">
            The <span className="text-primary">xLight</span>{' '}
            <span className="text-secondary">Sequence</span>{' '}
            <span className="text-accent">Marketplace</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover, purchase, and sell premium xLights sequences from creators worldwide.
            Professional quality sequences for every occasion.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/browse">
              <Button size="lg" className="text-lg shadow-lg hover:shadow-primary/50 transition-all duration-300">
                Browse Sequences
              </Button>
            </Link>
            <Link href="/become-seller">
              <Button variant="outline" size="lg" accent="secondary" className="text-lg shadow-lg hover:shadow-secondary/50 transition-all duration-300">
                Become a Seller
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Creators */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold mb-6">
              Featured <span className="text-primary">Creators</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12">
              Discover sequences from our top-rated creators
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface rounded-xl p-8 border border-primary/20 hover-glow-primary transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mr-4 text-xl font-bold text-background">
                    C{i}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-white text-lg">Creator {i}</h3>
                    <div className="flex items-center text-accent mt-1">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      <span className="text-sm">4.9 (120 reviews)</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Specializing in Halloween and Christmas sequences with over 50 premium designs.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-bold text-base">24 Sequences</span>
                  <Link href="#" className="text-secondary hover:text-accent transition-colors text-base font-medium">
                    View Profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Sequences Preview */}
      <section className="py-20 px-6 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold mb-6">
              Top <span className="text-accent">Sequences</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12">
              Explore the most popular and highly-rated sequences on the marketplace.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {/* SequenceCard components will go here */}
            {displayedSequences.map((sequence) => (
              <SequenceCard key={sequence.id} sequence={sequence} />
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Link href="/browse">
              <Button size="lg" variant="outline" accent="primary" className="text-lg shadow-lg hover:shadow-primary/50 transition-all duration-300">
                View All Sequences
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center bg-surface rounded-xl p-10 border border-primary/20 hover-glow-accent transition-all duration-300">
          <h2 className="text-4xl font-heading font-bold mb-6">
            Stay Updated with <span className="text-accent">SequenceHUB</span>
          </h2>
          <p className="text-gray-400 text-lg mb-12">
            Subscribe to our newsletter for the latest sequences, creator spotlights, and exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Input
              type="email"
              placeholder="Your email address"
              className="max-w-sm w-full bg-background border-primary/30 focus:border-accent transition-colors text-white px-4 py-2 rounded-md"
            />
            <Button accent="accent" className="text-lg shadow-lg hover:shadow-accent/50 transition-all duration-300">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  )
}
