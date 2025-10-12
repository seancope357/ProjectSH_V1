import React from 'react'

export type ActivityItem = {
  id: string
  ts: string
  kind: 'sale' | 'message' | 'payout' | 'listing'
  summary: string
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const color = (k: ActivityItem['kind']) => {
    switch (k) {
      case 'sale':
        return 'text-green-600'
      case 'message':
        return 'text-blue-600'
      case 'payout':
        return 'text-purple-600'
      case 'listing':
        return 'text-amber-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h2>
      {items.length === 0 ? (
        <p className="text-gray-500">Quiet day. No recent activity.</p>
      ) : (
        <ul className="space-y-3">
          {items.map(it => (
            <li key={it.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">
                  <span className={`font-medium ${color(it.kind)}`}>
                    {it.kind}
                  </span>
                  {' · '}
                  {it.summary}
                </p>
                <p className="text-xs text-gray-500">{it.ts}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
