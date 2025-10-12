import React from 'react'
import { Package } from 'lucide-react'

export type OrderItem = {
  id: string
  buyer: string
  ageLabel: string
  items: number
  status: 'open' | 'shipped' | 'completed'
}

export function OrdersQueue({ orders }: { orders: OrderItem[] }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <Package className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
      </div>
      {orders.length === 0 ? (
        <p className="text-gray-500">No open orders.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2">Order</th>
                <th className="py-2">Buyer</th>
                <th className="py-2">Items</th>
                <th className="py-2">Age</th>
                <th className="py-2">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-gray-100">
                  <td className="py-3 font-medium text-gray-900">#{o.id}</td>
                  <td className="py-3 text-gray-700">{o.buyer}</td>
                  <td className="py-3 text-gray-700">{o.items}</td>
                  <td className="py-3 text-gray-700">{o.ageLabel}</td>
                  <td className="py-3">
                    <span className="rounded-full px-2 py-1 text-xs border border-gray-300 text-gray-700">
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-blue-700 hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
