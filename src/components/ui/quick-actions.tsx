import React from 'react'

export type QuickAction = {
  id: string
  label: string
  onClick?: () => void
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-wrap gap-3">
        {actions.map(a => (
          <button
            key={a.id}
            onClick={a.onClick}
            className="text-sm rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}
