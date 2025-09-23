'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/ui/navigation'
import { Search, Filter, Grid, List, Star, Download, Zap, Monitor, Settings, Save, User } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Sequence {
  id: string
  title: string
  description: string
  price: number
  previewUrl: string
  category: string
  tags: string[]
  rating: number
  downloads: number
  createdAt: string
  seller: {
    name: string
  }
  compatibilityScore: number
  compatibilityDetails: any
  isCompatible: boolean
}

interface UserSetupProfile {
  ledCount: number
  controllerType: string
  voltage: string
  maxCurrent: number
  protocol: string
  refreshRate: number
}

interface FilterState {
  category: string
  sort: string
  minCompatibilityScore: number
  priceRange: [number, number]
  minRating: number
}

export default function CompatibilityDiscoveryPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [showSetupModal, setShowSetupModal] = useState(false)

  // Local Storage utility functions
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  const getFromLocalStorage = (key: string) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Failed to read from localStorage:', error)
      return null
    }
  }
  const [userSetup, setUserSetup] = useState<UserSetupProfile>({
    ledCount: 300,
    controllerType: 'ESP32',
    voltage: '5V',
    maxCurrent: 5.0,
    protocol: 'WS2812B',
    refreshRate: 60
  })
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    sort: 'compatibility',
    minCompatibilityScore: 70,
    priceRange: [0, 100],
    minRating: 0
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasSetup, setHasSetup] = useState(false)

  const controllerTypes = ['ESP32', 'ESP8266', 'Arduino Uno', 'Arduino Nano', 'Raspberry Pi', 'WLED Controller', 'FadeCandy', 'PixelBlaze']
  const protocols = ['WS2812B', 'WS2811', 'APA102', 'SK6812', 'WS2801', 'LPD8806', 'P9813']
  const categories = ['all', 'christmas', 'halloween', 'music-reactive', 'ambient', 'party', 'seasonal', 'abstract']

  // Load user setup profile on mount
  useEffect(() => {
    if (session?.user) {
      loadUserSetup()
    }
  }, [session])

  // Search sequences when setup or filters change
  useEffect(() => {
    if (hasSetup) {
      searchCompatibleSequences()
    }
  }, [userSetup, filters, currentPage, hasSetup])

  const loadUserSetup = async () => {
    // First try to load from localStorage
    const localSetup = getFromLocalStorage('userSetupProfile')
    if (localSetup) {
      setUserSetup(localSetup)
      setHasSetup(true)
      return
    }

    // If not in localStorage and user is logged in, try to load from server
    if (session?.user) {
      try {
        const response = await fetch('/api/user/setup-profile')
        if (response.ok) {
          const data = await response.json()
          if (data.setupProfile) {
            setUserSetup(data.setupProfile)
            setHasSetup(true)
            // Save to localStorage for future use
            saveToLocalStorage('userSetupProfile', data.setupProfile)
          } else {
            setShowSetupModal(true)
          }
        }
      } catch (error) {
        console.error('Failed to load user setup:', error)
        setShowSetupModal(true)
      }
    } else {
      // If no session, show setup modal
      setShowSetupModal(true)
    }
  }

  const saveUserSetup = async () => {
    try {
      // Always save to localStorage first
      saveToLocalStorage('userSetupProfile', userSetup)
      
      // If user is logged in, also save to server
      if (session?.user) {
        const response = await fetch('/api/user/setup-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userSetup)
        })
        
        if (!response.ok) {
          console.error('Failed to save to server, but saved locally')
        }
      }
      
      setHasSetup(true)
      setShowSetupModal(false)
      
      // Redirect to sequences page with compatibility filter enabled
      router.push('/sequences?compatibility=true')
      
    } catch (error) {
      console.error('Failed to save user setup:', error)
    }
  }

  const searchCompatibleSequences = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sequences/compatible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: userSetup,
          category: filters.category,
          sort: filters.sort,
          page: currentPage,
          limit: 12,
          minCompatibilityScore: filters.minCompatibilityScore
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSequences(data.sequences)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Failed to search sequences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetupChange = (field: keyof UserSetupProfile, value: any) => {
    setUserSetup(prev => ({ ...prev, [field]: value }))
  }

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setCurrentPage(1)
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`
  }

  // Setup Modal
  if (showSetupModal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Setup Your LED System</h2>
                <Monitor className="w-8 h-8 text-blue-600" />
              </div>
              
              <p className="text-gray-600 mb-6">
                Tell us about your LED setup so we can find sequences that are perfectly compatible with your system.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of LEDs *
                  </label>
                  <input
                    type="number"
                    value={userSetup.ledCount || ''}
                    onChange={(e) => handleSetupChange('ledCount', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Controller Type *
                  </label>
                  <select
                    value={userSetup.controllerType}
                    onChange={(e) => handleSetupChange('controllerType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {controllerTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operating Voltage
                  </label>
                  <select
                    value={userSetup.voltage}
                    onChange={(e) => handleSetupChange('voltage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="3.3V">3.3V</option>
                    <option value="5V">5V</option>
                    <option value="12V">12V</option>
                    <option value="24V">24V</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Current (Amps)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={userSetup.maxCurrent || ''}
                    onChange={(e) => handleSetupChange('maxCurrent', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 5.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LED Protocol
                  </label>
                  <select
                    value={userSetup.protocol}
                    onChange={(e) => handleSetupChange('protocol', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {protocols.map((protocol) => (
                      <option key={protocol} value={protocol}>{protocol}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Refresh Rate (Hz)
                  </label>
                  <input
                    type="number"
                    value={userSetup.refreshRate || ''}
                    onChange={(e) => handleSetupChange('refreshRate', parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                {!session ? (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 text-right">
                      💡 <strong>Sign in to save your setup</strong> and sync across devices
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => router.push('/auth/signin')}
                        className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 flex items-center transition-colors"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Sign In
                      </button>
                      <button
                        onClick={saveUserSetup}
                        disabled={!userSetup.ledCount || !userSetup.controllerType}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Continue as Guest
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={saveUserSetup}
                    disabled={!userSetup.ledCount || !userSetup.controllerType}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save & Find Sequences
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Compatibility Discovery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find LED sequences that are perfectly compatible with your hardware setup. 
            Get personalized recommendations based on your configuration.
          </p>
        </header>
        
        {/* Current Setup Display */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Compatible Sequences
            </h2>
            <p className="text-gray-600">
              Sequences perfectly matched to your {userSetup.controllerType} with {userSetup.ledCount} LEDs
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSetupModal(true)}
              className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Setup
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="compatibility">Best Compatibility</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="downloads">Most Downloaded</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Compatibility: {filters.minCompatibilityScore}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minCompatibilityScore}
                  onChange={(e) => handleFilterChange('minCompatibilityScore', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Rating: {filters.minRating} stars
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Finding compatible sequences...</span>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Found {sequences.length} compatible sequences for your setup
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sequences.map((sequence) => (
                  <div key={sequence.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-200 relative">
                      {sequence.previewUrl && (
                        <img
                          src={sequence.previewUrl}
                          alt={sequence.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getCompatibilityColor(sequence.compatibilityScore)}`}>
                        {sequence.compatibilityScore}%
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">{sequence.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{sequence.description}</p>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{sequence.rating}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Download className="w-4 h-4 mr-1" />
                          {sequence.downloads}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-blue-600">{formatPrice(sequence.price)}</span>
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sequences.map((sequence) => (
                  <div key={sequence.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg mr-3">{sequence.title}</h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCompatibilityColor(sequence.compatibilityScore)}`}>
                            {sequence.compatibilityScore}% Compatible
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{sequence.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            {sequence.rating}
                          </div>
                          <div className="flex items-center">
                            <Download className="w-4 h-4 mr-1" />
                            {sequence.downloads} downloads
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {sequence.seller.name}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 ml-6">
                        <span className="font-semibold text-blue-600 text-lg">{formatPrice(sequence.price)}</span>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}