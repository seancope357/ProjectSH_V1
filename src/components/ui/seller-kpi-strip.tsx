import React from 'react'

export type KpiItem = {
  label: string
  value: string | number
  hint?: string
  accent?: 'blue' | 'green' | 'purple' | 'yellow'
}

export function SellerKpiStrip({ items }: { items: KpiItem[] }) {
  const accentClass = (accent?: KpiItem['accent']) => {
    switch (accent) {
      case 'green':
        return 'text-green-600'
      case 'purple':
        return 'text-purple-600'
      case 'yellow':
        return 'text-yellow-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map(item => (
        <div key={item.label} className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500">{item.label}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${accentClass(item.accent)}`}>
              {item.value}
            </span>
            {item.hint && (
              <span className="text-xs text-gray-500">{item.hint}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
