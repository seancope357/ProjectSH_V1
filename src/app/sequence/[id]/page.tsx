import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db, supabaseAdmin } from '@/lib/supabase-db'
import { AddToCart } from '@/components/sequence/add-to-cart'
import { MediaPreview } from '@/components/sequence/media-preview'
import {
  Star,
  Download,
  Calendar,
  Shield,
  FileText,
  FileDown,
  Archive,
  Music,
  Import,
  Map,
  Save,
  User,
  CheckCircle2
} from 'lucide-react'

// Force dynamic because we might want real-time price/status
export const dynamic = 'force-dynamic'

export default async function SequenceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // 1. Fetch Sequence
  const sequence = await db.sequences.findById(id)

  if (!sequence) {
    notFound()
  }

  // 2. Fetch Reviews (Parallel)
  const { data: reviews } = await supabaseAdmin
    .from('reviews')
    .select('*, user:profiles(username)')
    .eq('sequence_id', id)
    .order('created_at', { ascending: false })

  const reviewList = reviews || []
  const rating = sequence.rating || 0
  const reviewCount = reviewList.length

  // Parse specs if JSON, or use defaults
  const specs = sequence.specifications || {
    duration: 0,
    frameRate: 40,
    resolution: 'HD',
    fileSize: 'Unknown',
    format: 'FSEQ',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb / Nav (Optional, handled by layout but good to have padding) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Media & Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Media Player */}
            <MediaPreview 
              url={sequence.preview_url} 
              thumbnailUrl={sequence.thumbnail_url}
              title={sequence.title}
              sequenceId={sequence.id}
            />

            {/* Header Info (Mobile Only - usually) but let's keep it standard */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                  {sequence.category?.name || 'Uncategorized'}
                </span>
                {Array.isArray(sequence.tags) && sequence.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {sequence.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium text-gray-900">{rating.toFixed(1)}</span>
                  <span className="text-gray-400">({reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Download className="w-5 h-5 text-gray-400" />
                  <span>{sequence.download_count || 0} downloads</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>Updated {new Date(sequence.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 prose max-w-none">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this sequence</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {sequence.description}
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                   <div className="text-sm text-gray-500 mb-1">Duration</div>
                   <div className="font-semibold text-gray-900">{specs.duration}s</div>
                </div>
                <div>
                   <div className="text-sm text-gray-500 mb-1">Frame Rate</div>
                   <div className="font-semibold text-gray-900">{specs.frameRate} FPS</div>
                </div>
                <div>
                   <div className="text-sm text-gray-500 mb-1">Format</div>
                   <div className="font-semibold text-gray-900">{specs.format}</div>
                </div>
                <div>
                   <div className="text-sm text-gray-500 mb-1">File Size</div>
                   <div className="font-semibold text-gray-900">{specs.fileSize}</div>
                </div>
              </div>
            </div>

            {/* Import Instructions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Installation Guide
                </h2>
              </div>
              <div className="p-6">
                 <div className="grid gap-6 md:grid-cols-2">
                    {[
                      { icon: FileDown, title: 'Download', desc: 'Save to a separate folder' },
                      { icon: Archive, title: 'Unzip', desc: 'Extract all files' },
                      { icon: Music, title: 'New Sequence', desc: 'Start with audio file' },
                      { icon: Import, title: 'Import Effects', desc: 'Map to your layout' },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            <step.icon className="w-4 h-4 text-gray-400" />
                            {step.title}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Customer Reviews
              </h2>
              {reviewList.length > 0 ? (
                <div className="grid gap-4">
                  {reviewList.map((review: any) => (
                    <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                               {review.user?.username?.[0]?.toUpperCase() || 'U'}
                             </div>
                             <span className="font-medium text-gray-900">{review.user?.username || 'User'}</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                       </div>
                       <div className="flex text-yellow-400 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                          ))}
                       </div>
                       <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                   <div className="text-gray-400 mb-2">No reviews yet</div>
                   <p className="text-sm text-gray-500">Be the first to share your experience!</p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Buy Box & Seller */}
          <div className="lg:col-span-1">
             <div className="sticky top-24 space-y-6">
                
                {/* Buy Box */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Shield className="w-24 h-24 rotate-12" />
                   </div>
                   
                   <div className="relative">
                      <div className="text-center mb-6">
                         <div className="text-4xl font-extrabold text-gray-900 mb-1">
                           ${sequence.price?.toFixed(2)}
                         </div>
                         <div className="text-sm font-medium text-green-600 bg-green-50 inline-block px-3 py-1 rounded-full">
                           Instant Download
                         </div>
                      </div>

                      <AddToCart sequenceId={sequence.id} price={sequence.price} />
                      
                      <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                         <div className="flex items-center gap-3 text-sm text-gray-600">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            <span>Commercial use license included</span>
                         </div>
                         <div className="flex items-center gap-3 text-sm text-gray-600">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            <span>Free updates for life</span>
                         </div>
                         <div className="flex items-center gap-3 text-sm text-gray-600">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            <span>24/7 Support access</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Seller Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                         <User className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                         <h3 className="font-bold text-gray-900">
                           {sequence.seller?.full_name || sequence.seller?.username || 'Unknown Seller'}
                         </h3>
                         <Link href={`/creator/${sequence.seller_id}`} className="text-sm text-blue-600 hover:underline">
                           View Profile
                         </Link>
                      </div>
                   </div>
                   <button className="w-full py-2 bg-gray-50 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                      Contact Seller
                   </button>
                </div>

             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
