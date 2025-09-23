'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Navigation } from '@/components/ui/navigation'
import { 
  Star, 
  Download, 
  Eye, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Play, 
  Pause,
  User,
  Calendar,
  Shield,
  FileDown,
  Archive,
  FileText,
  Music,
  Import,
  Map,
  Save,
  Info
} from 'lucide-react'

interface Sequence {
  id: string
  title: string
  description: string
  instructions?: string
  price: number
  previewUrl: string | null
  category: string
  tags: string[]
  rating: number
  downloadCount: number
  seller: {
    id: string
    username: string
    isVerified: boolean
    totalSales: number
    memberSince: string
  }
  createdAt: string
  updatedAt: string
  specifications: {
    duration: number
    frameRate: number
    resolution: string
    fileSize: string
    format: string
  }
}

interface Review {
  id: string
  rating: number
  comment: string
  user: {
    username: string
  }
  createdAt: string
}

export default function SequenceDetailsPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [sequence, setSequence] = useState<Sequence | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchSequence()
      fetchReviews()
      checkUserStatus()
    }
  }, [params.id, session]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSequence = async () => {
    try {
      const response = await fetch(`/api/sequences/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setSequence(data)
      }
    } catch (error) {
      console.error('Failed to fetch sequence:', error)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/sequences/${params.id}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkUserStatus = async () => {
    // Check local storage for favorites (works for both authenticated and non-authenticated users)
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setIsFavorited(savedFavorites.includes(params.id))

    if (!session) return

    try {
      // Check if favorited on server (for authenticated users)
      const favResponse = await fetch(`/api/user/favorites/${params.id}`)
      if (favResponse.ok) {
        const favData = await favResponse.json()
        setIsFavorited(favData.isFavorited)
      }

      // Check if in cart
      const cartResponse = await fetch('/api/cart')
      if (cartResponse.ok) {
        const cartData = await cartResponse.json()
        setIsInCart(cartData.items.some((item: { sequenceId: string }) => item.sequenceId === params.id))
      }

      // Check if purchased
      const purchaseResponse = await fetch(`/api/user/purchases/${params.id}`)
      if (purchaseResponse.ok) {
        const purchaseData = await purchaseResponse.json()
        setIsPurchased(purchaseData.isPurchased)
      }
    } catch (error) {
      console.error('Failed to check user status:', error)
    }
  }

  const handleAddToCart = async () => {
    if (!session) {
      // Redirect to login
      return
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequenceId: params.id })
      })

      if (response.ok) {
        setIsInCart(true)
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const handleToggleFavorite = async () => {
    // Handle local storage for non-authenticated users
    if (!session) {
      const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      const newFavorites = isFavorited 
        ? savedFavorites.filter((id: string) => id !== params.id)
        : [...savedFavorites, params.id]
      
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      setIsFavorited(!isFavorited)
      return
    }

    // Handle server sync for authenticated users
    try {
      const method = isFavorited ? 'DELETE' : 'POST'
      const response = await fetch(`/api/user/favorites/${params.id}`, {
        method
      })

      if (response.ok) {
        setIsFavorited(!isFavorited)
        
        // Also update local storage as backup
        const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
        const newFavorites = isFavorited 
          ? savedFavorites.filter((id: string) => id !== params.id)
          : [...savedFavorites, params.id]
        localStorage.setItem('favorites', JSON.stringify(newFavorites))
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: sequence?.title,
          text: sequence?.description,
          url: window.location.href
        })
      } catch (error) {
        console.error('Failed to share:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (!sequence) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sequence Not Found</h1>
          <p className="text-gray-600">The sequence you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Preview Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="aspect-video bg-gray-900 relative">
                {sequence.previewUrl ? (
                  <Image
                    src={sequence.previewUrl}
                    alt={sequence.title}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Eye className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Title and Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {sequence.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{sequence.rating.toFixed(1)} ({reviews.length} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{sequence.downloadCount} downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(sequence.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-2 rounded-lg border ${
                      isFavorited 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    } hover:bg-opacity-80`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg border bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {sequence.category}
                </span>
                {sequence.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed">
                {sequence.description}
              </p>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Specifications
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Duration</span>
                  <p className="font-medium">{sequence.specifications.duration}s</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Frame Rate</span>
                  <p className="font-medium">{sequence.specifications.frameRate} FPS</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Resolution</span>
                  <p className="font-medium">{sequence.specifications.resolution}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">File Size</span>
                  <p className="font-medium">{sequence.specifications.fileSize}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Format</span>
                  <p className="font-medium">{sequence.specifications.format}</p>
                </div>
              </div>
            </div>

            {/* xLights Import Instructions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                xLights Import Instructions
              </h2>
              
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileDown className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Download Sequence</span>
                      </div>
                      <p className="text-sm text-gray-600">Download to a directory outside your show directory</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Archive className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Unzip File</span>
                      </div>
                      <p className="text-sm text-gray-600">Keep the zipped file for importing</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Read Instructions</span>
                      </div>
                      <p className="text-sm text-gray-600">Check the included PDF for specific details</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      4
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Music className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Create New Sequence</span>
                      </div>
                      <p className="text-sm text-gray-600">Start a new musical sequence with the MP3</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      5
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Import className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Import Effects</span>
                      </div>
                      <p className="text-sm text-gray-600">Use Import/Import Effects from Sequencer tab</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      6
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Map className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Map Models</span>
                      </div>
                      <p className="text-sm text-gray-600">Map effects from right panel to left panel models</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      7
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Save className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Render and Save</span>
                      </div>
                      <p className="text-sm text-gray-600">Complete the process by rendering and saving</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 text-green-600 mt-0.5">
                    💡
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">Pro Tip</h4>
                    <p className="text-sm text-green-800 mt-1">
                      If you have multiple similar props (like multiple trees or arches), you can often map them to the same model group to save time during the mapping process.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Reviews ({reviews.length})
              </h2>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm text-gray-600">
                            {review.user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {review.user.username}
                            </span>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No reviews yet. Be the first to review this sequence!
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Purchase Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-4">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${sequence.price.toFixed(2)}
                </div>
                <p className="text-gray-500">One-time purchase</p>
              </div>

              {isPurchased ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Already Purchased</span>
                  </div>
                  <button className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors">
                    Download Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {isInCart ? (
                    <button className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium cursor-not-allowed">
                      Already in Cart
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                  )}
                  <button className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors">
                    Buy Now
                  </button>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>✓ Instant download after purchase</p>
                <p>✓ 30-day money-back guarantee</p>
                <p>✓ Commercial use allowed</p>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                About the Seller
              </h3>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {sequence.seller.username}
                    </span>
                    {sequence.seller.isVerified && (
                      <Shield className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(sequence.seller.memberSince).getFullYear()}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Sales:</span>
                  <span className="font-medium">{sequence.seller.totalSales}</span>
                </div>
              </div>

              <button className="w-full mt-4 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}