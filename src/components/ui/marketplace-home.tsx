'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Search,
  ArrowRight,
  TrendingUp,
  Star,
  Music,
  Calendar,
  TreePine,
  Home,
  Sparkles,
  Box,
  User,
  Play
} from 'lucide-react'
import { MarketInsights } from '@/lib/market-service'

interface MarketplaceHomeProps {
  initialInsights: MarketInsights
}

export function MarketplaceHome({ initialInsights }: MarketplaceHomeProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const insights = initialInsights
  const loading = false 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/sequences?q=${encodeURIComponent(q)}&sort=newest`)
  }

  // Map category names to icons/colors
  const getCategoryMeta = (name: string) => {
    const map: Record<string, { icon: any, color: string }> = {
      'Holiday & Seasonal': { icon: Calendar, color: 'bg-red-500' },
      'Music Sync': { icon: Music, color: 'bg-blue-500' },
      'Mega Tree': { icon: TreePine, color: 'bg-green-500' },
      'House Outline': { icon: Home, color: 'bg-orange-500' },
      'RGB Effects': { icon: Sparkles, color: 'bg-purple-500' },
      'Props & Elements': { icon: Box, color: 'bg-pink-500' },
    }
    return map[name] || { icon: Box, color: 'bg-gray-500' }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      
      {/* 1. Night Mode Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white pb-20 pt-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
           <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
           <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-8 backdrop-blur-sm">
             <Sparkles className="w-3 h-3" />
             <span>The #1 Marketplace for xLights Creators</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 drop-shadow-lg">
             Sell your <span className="text-blue-500">xLights</span> sequences.<br/>
             Earn 85% per sale.
          </h1>
          
          <p className="text-xl text-blue-200/80 mb-10 max-w-2xl mx-auto leading-relaxed">
             Join SequenceHUB to monetize your work or shop pro‑grade shows from verified creators.
             Instant downloads, clear licensing, and a creator‑first marketplace.
          </p>

          {/* Search Bar - Glassmorphism */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12 relative group">
            <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl group-hover:bg-blue-500/20 transition-all duration-500" />
            <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 shadow-2xl">
               <Search className="w-6 h-6 text-blue-300 ml-4" />
               <input 
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 placeholder="Search for songs, props, or effects..."
                 className="w-full bg-transparent border-none text-white placeholder-blue-200/50 focus:ring-0 text-lg px-4 h-12"
               />
               <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/50">
                 Search
               </button>
            </div>
          </form>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/seller/onboarding"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-900 transition-all duration-200 bg-white rounded-full hover:bg-blue-50 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Start Selling
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/sequences"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 hover:scale-105 backdrop-blur-sm"
            >
              Browse Sequences
            </Link>
          </div>

          {/* Trust Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-sm font-medium text-blue-200/80 border-t border-white/10 pt-8">
             <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-white">85%</span>
                <span>Creator Payouts</span>
             </div>
             <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-white">100+</span>
                <span>Verified Creators</span>
             </div>
             <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-white">Instant</span>
                <span>Digital Delivery</span>
             </div>
          </div>
        </div>
      </section>

      {/* 2. Visual Categories */}
      <section className="py-16 bg-white relative -mt-8 rounded-t-3xl z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-bold text-slate-900">Explore by Prop</h2>
             <Link href="/categories" className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
               View All <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
             {(insights?.topCategories || []).slice(0, 6).map((cat) => {
               const meta = getCategoryMeta(cat.name)
               const Icon = meta.icon
               return (
                 <Link 
                   key={cat.name} 
                   href={`/sequences?category=${encodeURIComponent(cat.name)}`}
                   className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
                 >
                   <div className={`w-12 h-12 rounded-xl ${meta.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                   </div>
                   <h3 className="font-bold text-slate-900 text-center text-sm group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                   <span className="text-xs text-slate-500 mt-1">{cat.count} sequences</span>
                 </Link>
               )
             })}
          </div>
        </div>
      </section>

      {/* 3. Horizontal Scroll Trending */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
             <div>
               <h2 className="text-3xl font-bold text-slate-900">Trending Now</h2>
               <p className="text-slate-600 mt-1">Most downloaded sequences this week</p>
             </div>
             <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-white transition-colors">
                   <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                <button className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors">
                   <ArrowRight className="w-5 h-5" />
                </button>
             </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
             {(insights?.topByDownloads || []).slice(0, 8).map((seq) => (
               <Link 
                 key={seq.id}
                 href={`/sequence/${seq.id}`}
                 className="flex-none w-72 snap-center group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
               >
                 <div className="relative aspect-video bg-slate-100">
                    {seq.previewUrl ? (
                      <Image
                        src={seq.previewUrl}
                        alt={seq.title}
                        fill
                        className="object-cover"
                        unoptimized={seq.previewUrl.startsWith('data:')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Search className="w-8 h-8" />
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                       <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300">
                          <Play className="w-5 h-5 text-slate-900 fill-slate-900 ml-1" />
                       </div>
                    </div>
                 </div>
                 <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{seq.title}</h3>
                       <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-xs">
                         ${seq.price?.toFixed(2)}
                       </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                       <User className="w-3 h-3" />
                       <span className="line-clamp-1">{seq.seller?.displayName || 'Unknown Creator'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-400 border-t border-slate-100 pt-3">
                       <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{seq.rating.toFixed(1)}</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{seq.downloads} sold</span>
                       </div>
                    </div>
                 </div>
               </Link>
             ))}
          </div>
        </div>
      </section>

      {/* 4. Creator Spotlight (Social Proof) */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold mb-6 border border-yellow-500/20">
                     <Star className="w-3 h-3 fill-current" />
                     <span>Creator Spotlight</span>
                  </div>
                  <h2 className="text-4xl font-bold mb-4">Meet the Pros Behind the Shows</h2>
                  <p className="text-slate-400 text-lg mb-8">
                     Our marketplace features verified creators who live and breathe xLights. 
                     Get access to professional sequencing that would take hours to create yourself.
                  </p>
                  
                  <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-lg">
                           JD
                        </div>
                        <div>
                           <h4 className="font-bold">John Doe Lighting</h4>
                           <p className="text-sm text-slate-400">Specializes in Singing Faces & Mega Trees</p>
                        </div>
                        <button className="ml-auto px-4 py-2 rounded-lg bg-white/10 hover:bg-white text-sm font-bold hover:text-slate-900 transition-all">
                           View Profile
                        </button>
                     </div>
                     <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center font-bold text-lg">
                           SL
                        </div>
                        <div>
                           <h4 className="font-bold">Sarah's Lights</h4>
                           <p className="text-sm text-slate-400">Expert in House Outlines & HD Props</p>
                        </div>
                        <button className="ml-auto px-4 py-2 rounded-lg bg-white/10 hover:bg-white text-sm font-bold hover:text-slate-900 transition-all">
                           View Profile
                        </button>
                     </div>
                  </div>
               </div>
               
               <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-2xl opacity-30 animate-pulse" />
                  <div className="relative bg-slate-800 rounded-2xl p-8 border border-slate-700">
                     <h3 className="text-2xl font-bold mb-6">Live Activity</h3>
                     <div className="space-y-6">
                        {[
                           { action: 'purchased', item: 'Wizards in Winter', time: '2m ago', user: 'Mike T.' },
                           { action: 'reviewed', item: 'Christmas Canon', time: '15m ago', user: 'Sarah L.' },
                           { action: 'uploaded', item: 'Taylor Swift Mix', time: '1h ago', user: 'ProLights' },
                           { action: 'purchased', item: 'Mega Tree 360', time: '1h ago', user: 'Dave C.' },
                        ].map((activity, i) => (
                           <div key={i} className="flex items-center gap-4 text-sm">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              <p className="text-slate-300">
                                 <span className="font-bold text-white">{activity.user}</span>
                                 {' '}{activity.action}{' '}
                                 <span className="text-blue-400">{activity.item}</span>
                              </p>
                              <span className="ml-auto text-slate-500 text-xs">{activity.time}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 5. Editors' Picks Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
               <h2 className="text-3xl font-bold text-slate-900">Editors' Picks</h2>
               <p className="text-slate-600 mt-1">Hand-picked quality sequences</p>
            </div>
            <Link
              href="/sequences?sort=rating"
              className="mi-cta-secondary border px-4 py-2"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {(insights?.topByDownloads || []).slice(0, 8).map((seq) => (
                <Link
                  key={seq.id}
                  href={`/sequence/${seq.id}`}
                  className="group block"
                >
                   <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-300">
                      {seq.previewUrl ? (
                        <Image
                          src={seq.previewUrl}
                          alt={seq.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized={seq.previewUrl.startsWith('data:')}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <Search className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
                         ${seq.price?.toFixed(2)}
                      </div>
                   </div>
                   <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{seq.title}</h3>
                   <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{seq.rating.toFixed(1)}</span>
                      <span>•</span>
                      <span>{seq.downloads} downloads</span>
                   </div>
                </Link>
             ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-blue-600 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
         <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to light up the neighborhood?</h2>
            <p className="text-blue-100 text-lg mb-10">
               Whether you're buying your first sequence or selling your masterpiece,
               SequenceHUB is your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link 
                 href="/sequences" 
                 className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg"
               >
                 Shop Sequences
               </Link>
               <Link 
                 href="/seller/onboarding" 
                 className="px-8 py-4 bg-blue-700 text-white border border-blue-500 rounded-full font-bold hover:bg-blue-800 transition-colors"
               >
                 Become a Seller
               </Link>
            </div>
         </div>
      </section>
    </main>
  )
}
