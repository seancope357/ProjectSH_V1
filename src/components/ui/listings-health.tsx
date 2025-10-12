import React from 'react'

export type ListingHealthItem = {
  id: string
  title: string
  status: 'draft' | 'published' | 'suspended'
  views?: number
  rating?: number
}

export function ListingsHealth({ items }: { items: ListingHealthItem[] }) {
  const badge = (s: ListingHealthItem['status']) => {
    const map = {
      draft: 'bg-amber-50 text-amber-700 border-amber-200',
      published: 'bg-green-50 text-green-700 border-green-200',
      suspended: 'bg-red-50 text-red-700 border-red-200',
    }
    return `inline-block rounded-full border px-2 py-1 text-xs ${map[s]}`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Listings Health
      </h2>
      {items.length === 0 ? (
        <p className="text-gray-500">No listings yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map(it => (
            <li key={it.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{it.title}</p>
                <p className="text-xs text-gray-600">
                  {typeof it.views === 'number' ? `${it.views} views · ` : ''}
                  {typeof it.rating === 'number'
                    ? `${it.rating.toFixed(1)}★`
                    : ''}
                </p>
              </div>
              <span className={badge(it.status)}>{it.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
