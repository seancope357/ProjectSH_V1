'use client'

import React, { useState } from 'react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import { Star, MapPin, Calendar, Download, Eye, Heart, Filter, Grid, List } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface SellerProfile {
  id: string
  name: string
  displayName: string
  avatar: string
  coverImage: string
  bio: string
  location: string
  joinDate: string
  rating: number
  reviewCount: number
  totalSequences: number
  totalDownloads: number
  followers: number
  isFollowing: boolean
  specialties: string[]
  achievements: string[]
}

interface SellerSequence {
  id: string
  title: string
  description: string
  price: number
  thumbnail: string
  rating: number
  downloads: number
  createdAt: string
  tags: string[]
}

export default function SellerProfilePage() {
  const params = useParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [isFollowing, setIsFollowing] = useState(false)

  // Mock seller data - replace with actual data fetching
  const seller: SellerProfile = {
    id: '1',
    name: params.name as string,
    displayName: 'LightMaster Pro',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1545558014-8692c3eb5c50?q=80&w=1200&auto=format&fit=crop',
    bio: 'Professional light show designer with over 10 years of experience creating stunning Christmas and holiday displays. Specializing in synchronized music sequences and RGB pixel art.',
    location: 'Denver, Colorado',
    joinDate: '2022-03-15',
    rating: 4.9,
    reviewCount: 234,
    totalSequences: 45,
    totalDownloads: 12847,
    followers: 892,
    isFollowing: false,
    specialties: ['Christmas', 'Halloween', 'RGB Pixels', 'Music Sync', 'Mega Trees'],
    achievements: ['Top Seller 2023', 'Most Downloaded', 'Community Choice Award']
  }

  // Mock sequences data
  const sequences: SellerSequence[] = [
    {
      id: '1',
      title: 'Christmas Magic Spectacular',
      description: 'A breathtaking Christmas light sequence featuring synchronized music and stunning visual effects.',
      price: 29.99,
      thumbnail: 'https://images.unsplash.com/photo-1545558014-8692c3eb5c50?q=80&w=400&auto=format&fit=crop',
      rating: 4.8,
      downloads: 2847,
      createdAt: '2024-01-15',
      tags: ['Christmas', 'Holiday', 'Synchronized']
    },
    {
      id: '2',
      title: 'Halloween Spooky Show',
      description: 'Spine-chilling Halloween sequence with eerie effects and perfectly timed scares.',
      price: 24.99,
      thumbnail: 'https://images.unsplash.com/photo-1509557965043-6b9f3d7beddd?q=80&w=400&auto=format&fit=crop',
      rating: 4.7,
      downloads: 1923,
      createdAt: '2024-01-10',
      tags: ['Halloween', 'Spooky', 'Effects']
    },
    {
      id: '3',
      title: 'Summer Festival Lights',
      description: 'Vibrant summer sequence perfect for outdoor festivals and celebrations.',
      price: 19.99,
      thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop',
      rating: 4.6,
      downloads: 1456,
      createdAt: '2024-01-05',
      tags: ['Summer', 'Festival', 'Colorful']
    }
  ]

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    console.log(isFollowing ? 'Unfollowed' : 'Followed', seller.displayName)
  }

  const handleContact = () => {
    console.log('Contacting seller:', seller.displayName)
    // Implement contact functionality
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-r from-primary/20 to-secondary/20">
          <img
            src={seller.coverImage}
            alt={`${seller.displayName} cover`}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
          {/* Seller Header */}
          <div className="bg-surface rounded-lg p-6 border border-white/10 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <img
                src={seller.avatar}
                alt={seller.displayName}
                className="w-32 h-32 rounded-full object-cover border-4 border-primary"
              />
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">{seller.displayName}</h1>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(seller.rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'
                            }`}
                          />
                        ))}
                        <span className="text-white font-medium ml-1">{seller.rating}</span>
                        <span className="text-gray-400">({seller.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{seller.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={handleFollow} variant={isFollowing ? 'outline' : 'solid'}>
                      <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button onClick={handleContact} variant="outline">
                      Contact
                    </Button>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{seller.bio}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{seller.totalSequences}</div>
                    <div className="text-gray-400 text-sm">Sequences</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-secondary">{seller.totalDownloads.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">Downloads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-accent">{seller.followers}</div>
                    <div className="text-gray-400 text-sm">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{new Date(seller.joinDate).getFullYear()}</div>
                    <div className="text-gray-400 text-sm">Member Since</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-heading font-bold text-white">Sequences ({sequences.length})</h2>
                
                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-surface border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  
                  <div className="flex border border-white/20 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-surface text-gray-400 hover:text-white'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-surface text-gray-400 hover:text-white'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sequences Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sequences.map((sequence) => (
                    <Link key={sequence.id} href={`/sequence/${sequence.id}`}>
                      <div className="bg-surface rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-colors group">
                        <div className="relative aspect-video">
                          <img
                            src={sequence.thumbnail}
                            alt={sequence.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm font-semibold">
                            ${sequence.price}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-semibold mb-2 group-hover:text-primary transition-colors">
                            {sequence.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{sequence.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-white text-sm">{sequence.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                              <Download className="w-4 h-4" />
                              <span>{sequence.downloads}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sequences.map((sequence) => (
                    <Link key={sequence.id} href={`/sequence/${sequence.id}`}>
                      <div className="bg-surface rounded-lg p-4 border border-white/10 hover:border-primary/50 transition-colors group">
                        <div className="flex gap-4">
                          <img
                            src={sequence.thumbnail}
                            alt={sequence.title}
                            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-white font-semibold group-hover:text-primary transition-colors">
                                {sequence.title}
                              </h3>
                              <div className="text-xl font-bold text-accent">${sequence.price}</div>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">{sequence.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-white text-sm">{sequence.rating}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 text-sm">
                                  <Download className="w-4 h-4" />
                                  <span>{sequence.downloads}</span>
                                </div>
                              </div>
                              <div className="text-gray-400 text-sm">
                                {new Date(sequence.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Specialties */}
              <div className="bg-surface rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {seller.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full border border-primary/30"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-surface rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
                <div className="space-y-2">
                  {seller.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                      {achievement}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-surface rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-4 h-4 mr-3" />
                    <span>Joined {new Date(seller.joinDate).toLocaleDateString()}</span>
                  </div>
                  <Button onClick={handleContact} className="w-full">
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}