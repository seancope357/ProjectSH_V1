import { searchSequences } from '@/lib/market-service'
import { FilterSidebar } from '@/components/ui/filter-sidebar'
import { SequenceGrid } from '@/components/ui/sequence-grid'
import { Suspense } from 'react'
import { Filter } from 'lucide-react'
import Link from 'next/link'

export default async function SequencesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  
  // Parse params
  const q = typeof params.q === 'string' ? params.q : undefined
  const category = typeof params.category === 'string' ? params.category : undefined
  const sort = typeof params.sort === 'string' ? params.sort : undefined
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const minPrice = typeof params.minPrice === 'string' ? parseFloat(params.minPrice) : undefined
  const maxPrice = typeof params.maxPrice === 'string' ? parseFloat(params.maxPrice) : undefined

  const { sequences, total, totalPages } = await searchSequences({
    q,
    category,
    sort,
    page,
    limit: 12,
    minPrice,
    maxPrice,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Browse Sequences
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Discover thousands of professional-grade xLights sequences, 
            curated for your holiday display.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
               <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold">
                 <Filter className="w-5 h-5" />
                 <span>Filters</span>
               </div>
               <FilterSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
             {/* Mobile Filter Toggle (Simple Placeholder) */}
             <div className="lg:hidden mb-6">
                <details className="group">
                  <summary className="list-none flex items-center justify-between p-4 bg-white rounded-lg shadow-sm cursor-pointer">
                     <span className="font-semibold text-gray-900 flex items-center gap-2">
                       <Filter className="w-4 h-4" /> Filters
                     </span>
                     <span className="group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                    <FilterSidebar />
                  </div>
                </details>
             </div>

             {/* Results Status */}
             <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-900">{sequences.length}</span> of <span className="font-medium text-gray-900">{total}</span> results
                </p>
             </div>

             <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
                <SequenceGrid sequences={sequences} />
             </Suspense>

             {/* Pagination */}
             {totalPages > 1 && (
               <div className="mt-12 flex justify-center gap-2">
                 {page > 1 && (
                   <Link
                     href={{
                       query: { ...params, page: page - 1 }
                     }}
                     className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                   >
                     Previous
                   </Link>
                 )}
                 
                 <div className="flex items-center gap-1 px-2">
                   <span className="text-sm text-gray-600">
                     Page {page} of {totalPages}
                   </span>
                 </div>

                 {page < totalPages && (
                   <Link
                     href={{
                        query: { ...params, page: page + 1 }
                     }}
                     className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                   >
                     Next
                   </Link>
                 )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
