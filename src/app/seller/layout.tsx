'use client'

import { SecondaryNav } from '@/components/ui/secondary-nav'
import { VerticalToolbar } from '@/components/ui/vertical-toolbar'

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SecondaryNav />
      <div className="flex-1 flex">
        <VerticalToolbar />
        <main className="flex-1 w-full">{children}</main>
      </div>
    </div>
  )
}
