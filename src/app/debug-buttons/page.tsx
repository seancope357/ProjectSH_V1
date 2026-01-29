'use client'

import Button from '@/components/ui/Button'

export default function DebugButtons() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8">Button Debug Page</h1>
      
      <div className="space-y-8">
        {/* Test our Button component */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Our Button Component</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <Button size="sm">Small Button</Button>
              <span className="text-sm text-gray-500">Should have px-8 (32px total)</span>
            </div>
            <div className="flex gap-4 items-center">
              <Button size="md">Medium Button</Button>
              <span className="text-sm text-gray-500">Should have px-12 (48px total)</span>
            </div>
            <div className="flex gap-4 items-center">
              <Button size="lg">Large Button</Button>
              <span className="text-sm text-gray-500">Should have px-16 (64px total)</span>
            </div>
            <div className="flex gap-4 items-center">
              <Button size="xl">Extra Large Button</Button>
              <span className="text-sm text-gray-500">Should have px-20 (80px total)</span>
            </div>
          </div>
        </section>

        {/* Test raw HTML button with Tailwind classes */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Raw HTML Buttons with Tailwind</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <button className="px-8 py-2 bg-gray-800 text-white rounded-lg">px-8 Raw Button</button>
              <span className="text-sm text-gray-500">Direct px-8 class</span>
            </div>
            <div className="flex gap-4 items-center">
              <button className="px-12 py-2 bg-gray-800 text-white rounded-lg">px-12 Raw Button</button>
              <span className="text-sm text-gray-500">Direct px-12 class</span>
            </div>
            <div className="flex gap-4 items-center">
              <button className="px-16 py-2 bg-gray-800 text-white rounded-lg">px-16 Raw Button</button>
              <span className="text-sm text-gray-500">Direct px-16 class</span>
            </div>
          </div>
        </section>

        {/* Test with inline styles */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Buttons with Inline Styles</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <button 
                style={{ paddingLeft: '32px', paddingRight: '32px', padding: '8px 32px' }}
                className="bg-gray-800 text-white rounded-lg"
              >
                32px Inline Padding
              </button>
              <span className="text-sm text-gray-500">Inline style padding</span>
            </div>
            <div className="flex gap-4 items-center">
              <button 
                style={{ paddingLeft: '48px', paddingRight: '48px', padding: '8px 48px' }}
                className="bg-gray-800 text-white rounded-lg"
              >
                48px Inline Padding
              </button>
              <span className="text-sm text-gray-500">Inline style padding</span>
            </div>
          </div>
        </section>

        {/* CSS inspection helper */}
        <section>
          <h2 className="text-xl font-semibold mb-4">CSS Inspection</h2>
          <p className="text-sm text-gray-600 mb-4">
            Right-click on any button above and select &quot;Inspect Element&quot; to see the computed styles.
            Look for the padding values in the computed styles tab.
          </p>
        </section>
      </div>
    </div>
  )
}