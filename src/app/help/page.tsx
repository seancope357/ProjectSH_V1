'use client'

import { useState } from 'react'
// Removed page-level Navigation; global header renders in layout
import {
  Search,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Book,
  MessageCircle,
  Mail,
} from 'lucide-react'

const faqData = [
  {
    id: 1,
    category: 'Getting Started',
    questions: [
      {
        q: 'What is SequenceHUB?',
        a: 'SequenceHUB is a platform for sharing and discovering automation sequences, macros, and workflows that help streamline repetitive tasks across various applications and systems.',
      },
      {
        q: 'How do I create an account?',
        a: 'Click the "Sign Up" button in the top right corner, fill out the registration form with your email and password, then verify your email address to activate your account.',
      },
      {
        q: 'Is SequenceHUB free to use?',
        a: 'Yes, SequenceHUB offers a free tier that includes basic features. Premium plans are available for advanced features and increased storage limits.',
      },
    ],
  },
  {
    id: 2,
    category: 'Sequences',
    questions: [
      {
        q: 'How do I upload a sequence?',
        a: 'Navigate to your profile, click "Upload Sequence", fill out the details including title, description, category, and upload your sequence file. Make sure to test it before sharing.',
      },
      {
        q: 'What file formats are supported?',
        a: 'We support various formats including .json, .xml, .ahk (AutoHotkey), .py (Python), and custom sequence formats. Check our documentation for the complete list.',
      },
      {
        q: 'How do I ensure sequence quality?',
        a: 'All sequences go through our quality review process. You can also check user ratings and reviews before downloading to ensure you get high-quality content.',
      },
    ],
  },
  {
    id: 3,
    category: 'Account & Billing',
    questions: [
      {
        q: 'How do I upgrade to premium?',
        a: 'Go to your account settings and click "Upgrade Plan". Choose the plan that fits your needs and complete the payment process.',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes, you can cancel your subscription at any time from your account settings. Your premium features will remain active until the end of your billing period.',
      },
      {
        q: 'How do I reset my password?',
        a: 'Click "Forgot Password" on the login page, enter your email address, and follow the instructions in the reset email we send you.',
      },
    ],
  },
  {
    id: 4,
    category: 'Selling',
    questions: [
      {
        q: 'How do I become a seller?',
        a: 'Register for a seller account, complete the verification process, and start uploading your sequences. You can set your own prices and earn from each sale.',
      },
      {
        q: 'What are the seller fees?',
        a: 'We collect a 10% platform commission on each sale. This covers payment processing, hosting, and platform maintenance costs.',
      },
      {
        q: 'When do I get paid?',
        a: 'Payments are processed weekly on Fridays. You need to reach a minimum threshold of $25 before payouts are initiated.',
      },
    ],
  },
]

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<number[]>([1])
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([])

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const filteredFAQ = faqData
    .map(category => ({
      ...category,
      questions: category.questions.filter(
        q =>
          q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.a.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter(category => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global header handled by RootLayout */}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
          <p className="mt-2 text-gray-600">
            Find answers to common questions and get support
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Book className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Documentation
            </h3>
            <p className="text-gray-600 mb-4">
              Comprehensive guides and tutorials
            </p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              View Docs
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <MessageCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Community
            </h3>
            <p className="text-gray-600 mb-4">Connect with other users</p>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              Join Forum
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Mail className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Contact Us
            </h3>
            <p className="text-gray-600 mb-4">
              Get direct support from our team
            </p>
            <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
              Send Message
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-blue-500" />
              Frequently Asked Questions
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredFAQ.map(category => (
              <div key={category.id} className="p-6">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-lg font-medium text-gray-900">
                    {category.category}
                  </h3>
                  {expandedCategories.includes(category.id) ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                </button>

                {expandedCategories.includes(category.id) && (
                  <div className="mt-4 space-y-4">
                    {category.questions.map((qa, index) => {
                      const questionId = `${category.id}-${index}`
                      return (
                        <div
                          key={questionId}
                          className="border border-gray-200 rounded-lg"
                        >
                          <button
                            onClick={() => toggleQuestion(questionId)}
                            className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50"
                          >
                            <span className="font-medium text-gray-900">
                              {qa.q}
                            </span>
                            {expandedQuestions.includes(questionId) ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                          </button>

                          {expandedQuestions.includes(questionId) && (
                            <div className="px-4 pb-4">
                              <p className="text-gray-600">{qa.a}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Still need help?
          </h3>
          <p className="text-blue-700 mb-4">
            Can&apos;t find what you&apos;re looking for? Our support team is
            here to help.
          </p>
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}
