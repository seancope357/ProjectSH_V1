'use client'

// Removed page-level Navigation; global header renders in layout
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Global header handled by RootLayout */}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white">
            Community Guidelines
          </h1>
          <p className="mt-2 text-indigo-100">
            Rules and best practices for SequenceHUB
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl ring-1 ring-gray-200 shadow-sm p-6 mb-8">
          <div className="flex items-start gap-3">
            <Info aria-hidden="true" className="h-6 w-6 text-indigo-600 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to SequenceHUB
              </h2>
              <p className="text-gray-600">
                Our community thrives on collaboration, creativity, and respect.
                These guidelines help ensure a positive experience for everyone
                sharing and discovering automation sequences.
              </p>
            </div>
          </div>
        </div>

        {/* Content Guidelines */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl ring-1 ring-gray-200 shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle
              aria-hidden="true"
              className="h-6 w-6 text-green-600"
            />
            Content Guidelines
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                ✅ What to Share
              </h3>
              <p className="text-gray-600 mb-4">
                All sequences must meet our quality standards to ensure the best
                user experience:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Test your sequences thoroughly before submission</li>
                <li>• Provide clear documentation and usage instructions</li>
                <li>• Ensure sequences are optimized for performance</li>
                <li>• Include appropriate metadata and tags</li>
                <li>• Follow naming conventions for easy discovery</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                ❌ What Not to Share
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Malicious or harmful sequences</li>
                <li>• Sequences that violate software terms of service</li>
                <li>• Copyrighted content without permission</li>
                <li>• Spam or irrelevant content</li>
                <li>• Personal information or sensitive data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quality Standards */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl ring-1 ring-gray-200 shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <AlertTriangle
              aria-hidden="true"
              className="h-6 w-6 text-yellow-500"
            />
            Quality Standards
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Sequence Requirements
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Clear, descriptive titles</li>
                <li>• Detailed descriptions of functionality</li>
                <li>• Proper categorization</li>
                <li>• System requirements and setup details</li>
                <li>• Testing on target systems</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Documentation Standards
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Step-by-step setup instructions</li>
                <li>• Prerequisites and dependencies</li>
                <li>• Usage examples</li>
                <li>• Troubleshooting tips</li>
                <li>• Version history and updates</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Community Behavior */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl ring-1 ring-gray-200 shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle
              aria-hidden="true"
              className="h-6 w-6 text-green-600"
            />
            Community Behavior
          </h2>

          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900">Be Respectful</h3>
              <p className="text-gray-600">
                Treat all community members with respect and kindness.
              </p>
            </div>

            <div className="border-l-4 border-indigo-600 pl-4">
              <h3 className="font-medium text-gray-900">Be Helpful</h3>
              <p className="text-gray-600">
                Share knowledge, answer questions, and support fellow users.
              </p>
            </div>

            <div className="border-l-4 border-violet-600 pl-4">
              <h3 className="font-medium text-gray-900">Be Constructive</h3>
              <p className="text-gray-600">
                Provide constructive feedback and suggestions for improvement.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-medium text-gray-900">Be Original</h3>
              <p className="text-gray-600">
                Share your own work and give credit where it&apos;s due.
              </p>
            </div>
          </div>
        </div>

        {/* Enforcement */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl ring-1 ring-gray-200 shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <XCircle aria-hidden="true" className="h-6 w-6 text-red-500" />
            Enforcement
          </h2>

          <div className="space-y-4">
            <p className="text-gray-600">
              Violations of these guidelines may result in:
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">Warning</h3>
                <p className="text-yellow-700 text-sm">
                  First-time or minor violations
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-medium text-orange-800 mb-2">Suspension</h3>
                <p className="text-orange-700 text-sm">
                  Repeated or serious violations
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-800 mb-2">Ban</h3>
                <p className="text-red-700 text-sm">
                  Severe or persistent violations
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h3 className="font-medium text-blue-800 mb-2">Report Issues</h3>
              <p className="text-blue-700 text-sm">
                If you encounter content or behavior that violates these
                guidelines, please report it to our moderation team through the
                contact page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
