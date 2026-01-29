'use client'

import React, { useState } from 'react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import { Star, Play, Heart, ShoppingCart, Download, Eye, Clock, Zap } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface SequenceDetails {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  previewVideo?: string
  rating: number
  reviewCount: number
  seller: {
    name: string
    avatar: string
    totalSequences: number
    rating: number
  }
  downloads: number
  duration: string
  fileSize: string
  props: string[]
  tags: string[]
  createdAt: string
  lastUpdated: string
  features: string[]
}

export default function SequenceDetailPage() {
  const params = useParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)

  // Mock sequence data - replace with actual data fetching
  const sequence: SequenceDetails = {
    id: params.id as string,
    title: 'Christmas Magic Spectacular',
    description: 'A breathtaking Christmas light sequence featuring synchronized music and stunning visual effects. Perfect for residential displays with RGB pixel strips, matrix panels, and traditional string lights. This sequence includes multiple songs and creates a magical winter wonderland experience that will captivate your audience.',
    price: 29.99,
    images: [
      'https://images.unsplash.com/photo-1545558014-8692c3eb5c50?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?q=80&w=800&auto=format&fit=crop'
    ],
    previewVideo: 'https://example.com/preview-video.mp4',
    rating: 4.8,
    reviewCount: 127,
    seller: {
      name: 'LightMaster Pro',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop',
      totalSequences: 45,
      rating: 4.9
    },
    downloads: 2847,
    duration: '4:32',
    fileSize: '15.2 MB',
    props: ['RGB Pixel Strips', 'Matrix Panels', 'String Lights', 'Mega Tree', 'Arches'],
    tags: ['Christmas', 'Holiday', 'Festive', 'Family-Friendly', 'Synchronized'],
    createdAt: '2024-01-15',
    lastUpdated: '2024-01-20',
    features: [
      'Multi-song sequence',
      'Synchronized to music',
      'RGB color effects',
      'Fade and chase patterns',
      'Professional timing'
    ]
  }

  const handleAddToCart = () => {
    console.log('Adding to cart:', sequence.title)
    // Implement cart functionality
  }

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-surface border border-white/10">
                <img
                  src={sequence.images[currentImageIndex]}
                  alt={sequence.title}
                  className="w-full h-full object-cover"
                />
                {sequence.previewVideo && (
                  <button className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors group">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </button>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="flex gap-2 overflow-x-auto">
                {sequence.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index ? 'border-primary' : 'border-white/20'
                    }`}
                  >
                    <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Sequence Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-heading font-bold text-white mb-2">{sequence.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(sequence.rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'
                        }`}
                      />
                    ))}
                    <span className="text-white font-medium ml-1">{sequence.rating}</span>
                    <span className="text-gray-400">({sequence.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Download className="w-4 h-4" />
                    <span>{sequence.downloads.toLocaleString()} downloads</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-accent mb-4">${sequence.price.toFixed(2)}</div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handleAddToCart} size="lg" className="flex-1">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={toggleFavorite}
                  className={`px-4 ${isFavorited ? 'text-red-400 border-red-400' : ''}`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Seller Info */}
              <div className="bg-surface rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={sequence.seller.avatar}
                    alt={sequence.seller.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{sequence.seller.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{sequence.seller.totalSequences} sequences</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>{sequence.seller.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/seller/${sequence.seller.name}`}>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </Link>
                </div>
              </div>

              {/* Sequence Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface rounded-lg p-4 border border-white/10 text-center">
                  <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-white font-semibold">{sequence.duration}</div>
                  <div className="text-gray-400 text-sm">Duration</div>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-white/10 text-center">
                  <Zap className="w-5 h-5 text-secondary mx-auto mb-2" />
                  <div className="text-white font-semibold">{sequence.fileSize}</div>
                  <div className="text-gray-400 text-sm">File Size</div>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-white/10 text-center">
                  <Eye className="w-5 h-5 text-accent mx-auto mb-2" />
                  <div className="text-white font-semibold">{sequence.props.length}</div>
                  <div className="text-gray-400 text-sm">Props Used</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description and Details */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-surface rounded-lg p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
                <p className="text-gray-300 leading-relaxed">{sequence.description}</p>
              </div>

              {/* Features */}
              <div className="bg-surface rounded-lg p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
                <ul className="space-y-2">
                  {sequence.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Props Required */}
              <div className="bg-surface rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Props Required</h3>
                <div className="space-y-2">
                  {sequence.props.map((prop, index) => (
                    <div key={index} className="text-gray-300 text-sm">{prop}</div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-surface rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {sequence.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full border border-primary/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-surface rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white">{new Date(sequence.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-white">{new Date(sequence.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">File Format</span>
                    <span className="text-white">xLights (.xsq)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}