'use client'

import React, { useState } from 'react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import { User, Mail, Phone, MapPin, Calendar, Download, Star, Edit, Save, X } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  location: string
  joinDate: string
  avatar: string
  totalPurchases: number
  totalSpent: number
  favoriteSequences: number
}

interface Purchase {
  id: string
  sequenceTitle: string
  price: number
  purchaseDate: string
  downloadCount: number
  maxDownloads: number
  status: 'completed' | 'pending' | 'refunded'
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  // Mock user data - replace with actual data fetching
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: '2023-06-15',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
    totalPurchases: 12,
    totalSpent: 347.88,
    favoriteSequences: 8
  })

  const [editForm, setEditForm] = useState(userProfile)

  // Mock purchase history
  const purchases: Purchase[] = [
    {
      id: '1',
      sequenceTitle: 'Christmas Magic Spectacular',
      price: 29.99,
      purchaseDate: '2024-01-15',
      downloadCount: 2,
      maxDownloads: 5,
      status: 'completed'
    },
    {
      id: '2',
      sequenceTitle: 'Halloween Spooky Show',
      price: 24.99,
      purchaseDate: '2024-01-10',
      downloadCount: 1,
      maxDownloads: 5,
      status: 'completed'
    },
    {
      id: '3',
      sequenceTitle: 'Summer Festival Lights',
      price: 19.99,
      purchaseDate: '2024-01-05',
      downloadCount: 0,
      maxDownloads: 5,
      status: 'pending'
    }
  ]

  const handleSaveProfile = () => {
    setUserProfile(editForm)
    setIsEditing(false)
    console.log('Profile updated:', editForm)
  }

  const handleCancelEdit = () => {
    setEditForm(userProfile)
    setIsEditing(false)
  }

  const handleDownload = (purchaseId: string) => {
    console.log('Downloading sequence:', purchaseId)
    // Implement download functionality
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Profile Header */}
          <div className="bg-surface rounded-lg p-6 border border-white/10 mb-8">
            <div className="flex items-start gap-6">
              <div className="relative">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors">
                  <Edit className="w-4 h-4 text-white" />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-heading font-bold text-white">{userProfile.name}</h1>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{userProfile.totalPurchases}</div>
                    <div className="text-gray-400 text-sm">Total Purchases</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">${userProfile.totalSpent.toFixed(2)}</div>
                    <div className="text-gray-400 text-sm">Total Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{userProfile.favoriteSequences}</div>
                    <div className="text-gray-400 text-sm">Favorites</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary text-white'
                  : 'bg-surface text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'purchases'
                  ? 'bg-primary text-white'
                  : 'bg-surface text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              Purchase History
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <div className="bg-surface rounded-lg p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <div className="text-white">{userProfile.name}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <div className="text-white">{userProfile.email}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <div className="text-white">{userProfile.phone}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <div className="text-white">{userProfile.location}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Member Since
                  </label>
                  <div className="text-white">{new Date(userProfile.joinDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'purchases' && (
            <div className="space-y-4">
              <div className="bg-surface rounded-lg p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-6">Purchase History</h2>
                
                {purchases.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">No purchases yet</div>
                    <Button>Browse Sequences</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchases.map((purchase) => (
                      <div key={purchase.id} className="bg-background rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold mb-1">{purchase.sequenceTitle}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>Purchased: {new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                              <span>${purchase.price.toFixed(2)}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                purchase.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                purchase.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <div className="text-gray-400">Downloads</div>
                              <div className="text-white">{purchase.downloadCount}/{purchase.maxDownloads}</div>
                            </div>
                            
                            {purchase.status === 'completed' && (
                              <Button
                                onClick={() => handleDownload(purchase.id)}
                                variant="outline"
                                size="sm"
                                disabled={purchase.downloadCount >= purchase.maxDownloads}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}