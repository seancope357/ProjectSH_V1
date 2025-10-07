'use client'

import { Navigation } from '@/components/ui/navigation'
import { Music, ShieldCheck, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function LicensingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Song Licensing for Xlights</h1>
            <p className="mt-2 text-gray-600">Buy rights to use music in your sequences</p>
          </div>
          <Music className="h-8 w-8 text-purple-600" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Why Licensing Matters */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Stay Compliant</h2>
          </div>
          <p className="text-gray-700">
            Using commercial songs without proper licensing can result in takedowns or legal issues. Choose a licensing partner and obtain the appropriate rights for your public displays, recordings, and shared sequences.
          </p>
        </section>

        {/* Recommended Providers */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Licensing Providers</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'Lickd', url: 'https://lickd.co/', notes: 'Mainstream commercial tracks with YouTube clearance options.' },
              { name: 'Soundstripe', url: 'https://soundstripe.com/', notes: 'Subscription library with broad usage licensing.' },
              { name: 'Epidemic Sound', url: 'https://www.epidemicsound.com/', notes: 'Large catalog, simple licensing for creators.' },
              { name: 'Artlist', url: 'https://artlist.io/', notes: 'Royalty-free tracks with creator-friendly plans.' },
            ].map((p) => (
              <div key={p.name} className="p-4 border rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-sm text-gray-600">{p.notes}</div>
                  </div>
                  <Link
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
                  >
                    Visit
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to License a Song</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Pick a provider and search for your desired track.</li>
            <li>Choose a plan that covers your intended use (public display, online video, resale in sequences if applicable).</li>
            <li>Complete checkout and keep your license confirmation.</li>
            <li>Document the license in your sequence metadata (song title, provider, license ID).</li>
          </ol>
          <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded p-3">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Add proof of license to your sequence description to streamline reviews.</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Not all licenses permit redistribution; ensure your usage includes performance/display rights for Xlights shows.</span>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/creator" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Back to Creator Hub</Link>
            <Link href="/sequences" className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">Browse Sequences</Link>
          </div>
        </section>
      </div>
    </div>
  )
}