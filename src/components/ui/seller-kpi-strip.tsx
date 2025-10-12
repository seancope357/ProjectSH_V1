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
        return 'text-blue-700'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map(item => (
        <div key={item.label} className="mi-card mi-surface p-6 mi-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{item.label}</p>
            <span className="mi-badge bg-orange-100 text-orange-700">KPI</span>
          </div>
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
