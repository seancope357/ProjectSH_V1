import React from 'react'

export type QuickAction = {
  id: string
  label: string
  onClick?: () => void
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="mi-card mi-surface p-4">
      <div className="flex flex-wrap gap-3">
        {actions.map(a => (
          <button
            key={a.id}
            onClick={a.onClick}
            className="mi-cta-secondary px-3 py-2 border border-gray-300"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}
