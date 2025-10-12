import React from 'react'
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react'

export type TopTask = {
  id: string
  label: string
  count: number
  icon: 'overdue' | 'messages' | 'renewal'
  action?: () => void
}

export function SellerTopTasks({ tasks }: { tasks: TopTask[] }) {
  const iconFor = (t: TopTask['icon']) => {
    switch (t) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'messages':
        return <MessageSquare className="w-4 h-4 text-blue-600" />
      case 'renewal':
        return <RefreshCw className="w-4 h-4 text-amber-600" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Today’s Top Tasks
      </h2>
      {tasks.length === 0 ? (
        <p className="text-gray-500">Nothing urgent. You’re all set.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(t => (
            <button
              key={t.id}
              onClick={t.action}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {iconFor(t.icon)}
                <span className="text-sm text-gray-800">{t.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {t.count}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
