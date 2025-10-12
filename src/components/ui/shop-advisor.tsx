import React from 'react'

export type AdvisorTip = {
  id: string
  title: string
  description: string
  ctaLabel?: string
  onClick?: () => void
}

export function ShopAdvisor({ tips }: { tips: AdvisorTip[] }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop Advisor</h2>
      {tips.length === 0 ? (
        <p className="text-gray-500">No recommendations right now.</p>
      ) : (
        <div className="space-y-4">
          {tips.map(t => (
            <div key={t.id} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{t.title}</p>
                <p className="text-sm text-gray-600">{t.description}</p>
              </div>
              {t.ctaLabel && (
                <button
                  onClick={t.onClick}
                  className="text-sm rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50"
                >
                  {t.ctaLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
