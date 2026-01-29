'use client'

import React, { useState } from 'react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Search,
  Book,
  Video,
  Download,
  CreditCard,
  Shield,
  Settings
} from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

interface SupportCategory {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  articles: number
}

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('faq')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  })

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I download my purchased sequences?',
      answer: 'After purchasing a sequence, you can download it from your Profile page under the "Purchase History" tab. Each sequence can be downloaded up to 5 times. Click the "Download" button next to your purchased sequence.',
      category: 'downloads'
    },
    {
      id: '2',
      question: 'What file formats are supported?',
      answer: 'We primarily support xLights sequence files (.xsq), which are compatible with most popular light show software. Some sequences may also include additional formats like Vixen or Light-O-Rama files.',
      category: 'technical'
    },
    {
      id: '3',
      question: 'Can I get a refund for my purchase?',
      answer: 'We offer refunds within 30 days of purchase if the sequence doesn\'t work as described or has technical issues. Digital downloads that have been successfully downloaded may have limited refund eligibility.',
      category: 'billing'
    },
    {
      id: '4',
      question: 'How do I become a seller on SequenceHUB?',
      answer: 'To become a seller, click on "Become a Seller" in the navigation menu. You\'ll need to provide some basic information, verify your identity, and agree to our seller terms. Once approved, you can start uploading your sequences.',
      category: 'selling'
    },
    {
      id: '5',
      question: 'What props do I need for each sequence?',
      answer: 'Each sequence listing includes a detailed "Props Required" section that lists all the lighting elements needed. This typically includes RGB pixel strips, matrix panels, string lights, and specific configurations.',
      category: 'technical'
    },
    {
      id: '6',
      question: 'How do I sync sequences to music?',
      answer: 'Most sequences come pre-synchronized to specific songs. You\'ll need to obtain the music separately and ensure your light controller software is properly configured for audio playback synchronization.',
      category: 'technical'
    }
  ]

  const supportCategories: SupportCategory[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of using SequenceHUB',
      icon: <Book className="w-6 h-6" />,
      articles: 12
    },
    {
      id: 'downloads',
      title: 'Downloads & Files',
      description: 'Help with downloading and using sequences',
      icon: <Download className="w-6 h-6" />,
      articles: 8
    },
    {
      id: 'billing',
      title: 'Billing & Payments',
      description: 'Payment issues and billing questions',
      icon: <CreditCard className="w-6 h-6" />,
      articles: 6
    },
    {
      id: 'technical',
      title: 'Technical Support',
      description: 'Technical issues and troubleshooting',
      icon: <Settings className="w-6 h-6" />,
      articles: 15
    },
    {
      id: 'selling',
      title: 'Selling Sequences',
      description: 'Information for sequence creators',
      icon: <Shield className="w-6 h-6" />,
      articles: 10
    },
    {
      id: 'tutorials',
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      icon: <Video className="w-6 h-6" />,
      articles: 20
    }
  ]

  const filteredFAQs = faqItems.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Contact form submitted:', contactForm)
    // Implement contact form submission
    alert('Thank you for your message! We\'ll get back to you within 24 hours.')
    setContactForm({
      name: '',
      email: '',
      subject: '',
      category: 'general',
      message: ''
    })
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-heading font-bold text-white mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Find answers to common questions or get in touch with our support team
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-4 bg-surface border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary text-lg"
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center space-x-1 mb-8">
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'faq'
                  ? 'bg-primary text-white'
                  : 'bg-surface text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'bg-primary text-white'
                  : 'bg-surface text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              Help Categories
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'contact'
                  ? 'bg-primary text-white'
                  : 'bg-surface text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              Contact Us
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'faq' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Frequently Asked Questions
                </h2>
                <p className="text-gray-400">
                  {searchQuery ? `Found ${filteredFAQs.length} results` : `${faqItems.length} common questions and answers`}
                </p>
              </div>
              
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="bg-surface rounded-lg border border-white/10">
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <span className="text-white font-medium">{faq.question}</span>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {filteredFAQs.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">No FAQ items found matching your search</div>
                  <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-semibold text-white mb-2">Help Categories</h2>
                <p className="text-gray-400">Browse help articles by category</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supportCategories.map((category) => (
                  <div key={category.id} className="bg-surface rounded-lg p-6 border border-white/10 hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        {category.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-white font-semibold group-hover:text-primary transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-gray-400 text-sm">{category.articles} articles</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{category.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Form */}
                <div className="bg-surface rounded-lg p-6 border border-white/10">
                  <h2 className="text-2xl font-semibold text-white mb-6">Send us a message</h2>
                  
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <select
                        value={contactForm.category}
                        onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
                      >
                        <option value="general">General Question</option>
                        <option value="technical">Technical Support</option>
                        <option value="billing">Billing Issue</option>
                        <option value="seller">Seller Support</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                      <input
                        type="text"
                        required
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                      <textarea
                        required
                        rows={6}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                        placeholder="Please describe your issue or question in detail..."
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </div>

                {/* Contact Info */}
                <div className="space-y-6">
                  <div className="bg-surface rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Other ways to reach us</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-primary mr-3" />
                        <div>
                          <div className="text-white font-medium">Email Support</div>
                          <div className="text-gray-400 text-sm">support@sequencehub.com</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-secondary mr-3" />
                        <div>
                          <div className="text-white font-medium">Phone Support</div>
                          <div className="text-gray-400 text-sm">+1 (555) 123-4567</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-accent mr-3" />
                        <div>
                          <div className="text-white font-medium">Support Hours</div>
                          <div className="text-gray-400 text-sm">Mon-Fri: 9AM-6PM EST</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Response Times</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">General Questions</span>
                        <span className="text-white">24 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Technical Issues</span>
                        <span className="text-white">12 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Billing Problems</span>
                        <span className="text-white">6 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Urgent Issues</span>
                        <span className="text-white">2 hours</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-6 border border-primary/30">
                    <h3 className="text-lg font-semibold text-white mb-2">Need faster help?</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Check our FAQ section first - most questions are answered there instantly!
                    </p>
                    <Button onClick={() => setActiveTab('faq')} variant="outline">
                      Browse FAQ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}