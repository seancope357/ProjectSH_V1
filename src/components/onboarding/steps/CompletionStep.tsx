'use client'

import React from 'react'
import Button from '@/components/ui/Button'
import {
  CheckCircle,
  Upload,
  TrendingUp,
  Users,
  BookOpen,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

interface CompletionStepProps {
  sellerName: string
  onGoToDashboard: () => void
}

const CompletionStep: React.FC<CompletionStepProps> = ({
  sellerName,
  onGoToDashboard,
}) => {
  const nextSteps = [
    {
      icon: Upload,
      title: 'Upload Your First Sequence',
      description:
        'Start by uploading your best work. A strong first sequence sets the tone for your seller profile.',
      action: 'Upload Sequence',
      href: '/seller-dashboard?tab=upload',
    },
    {
      icon: TrendingUp,
      title: 'Optimize Your Profile',
      description:
        'Add a banner image, complete your bio, and showcase your best sequences on your seller page.',
      action: 'Edit Profile',
      href: '/seller-dashboard?tab=profile-settings',
    },
    {
      icon: BookOpen,
      title: 'Learn Best Practices',
      description:
        'Check out our seller resources to learn pricing strategies, marketing tips, and how to create compelling listings.',
      action: 'View Resources',
      href: '/seller-resources',
    },
  ]

  const tips = [
    {
      title: 'Price Competitively',
      description:
        'Research similar sequences in the marketplace. Most sequences range from $5-$50 depending on complexity.',
    },
    {
      title: 'High-Quality Previews',
      description:
        'Sequences with video previews sell 5x better. Show buyers what they are getting!',
    },
    {
      title: 'Detailed Descriptions',
      description:
        'Include props used, song info, duration, and any special requirements. Transparency builds trust.',
    },
    {
      title: 'Respond Quickly',
      description:
        'Fast response times lead to better reviews. Aim to answer questions within 24 hours.',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-6 animate-pulse">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
          Welcome to SequenceHUB, {sellerName}!
        </h3>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          Your seller account is all set up. You are now ready to start sharing your
          sequences with thousands of xLights enthusiasts around the world.
        </p>
      </div>

      {/* Stats Teaser */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-primary mb-1">10k+</div>
          <div className="text-xs text-white/60">Active Buyers</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-secondary mb-1">$50k+</div>
          <div className="text-xs text-white/60">Earned by Sellers</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-accent mb-1">4.8</div>
          <div className="text-xs text-white/60">Avg. Rating</div>
        </div>
      </div>

      {/* Next Steps */}
      <div>
        <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Your Next Steps
        </h4>
        <div className="space-y-3">
          {nextSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-white mb-1">{step.title}</h5>
                    <p className="text-sm text-white/60 mb-3">{step.description}</p>
                    <Link href={step.href}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 group-hover:border-primary/40"
                      >
                        {step.action}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Tips */}
      <div>
        <h4 className="text-xl font-semibold text-white mb-4">
          Quick Tips for Success
        </h4>
        <div className="grid gap-3 md:grid-cols-2">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <h5 className="font-semibold text-white mb-1 text-sm">{tip.title}</h5>
              <p className="text-xs text-white/60">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="pt-6 border-t border-white/10">
        <div className="flex flex-col items-center gap-4">
          <Button onClick={onGoToDashboard} size="lg" className="gap-2 min-w-[200px]">
            Go to Dashboard
            <ArrowRight className="h-5 w-5" />
          </Button>
          <p className="text-sm text-white/50 text-center max-w-md">
            You can always return to your dashboard to manage sequences, view sales,
            and update your profile.
          </p>
        </div>
      </div>

      {/* Support */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <h4 className="font-semibold text-white mb-2">Need Help?</h4>
        <p className="text-sm text-white/70 mb-3">
          Our seller support team is here to help you succeed. Check out our resources
          or contact us anytime.
        </p>
        <div className="flex gap-3">
          <Link href="/support">
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </Link>
          <Link href="/seller-resources">
            <Button variant="outline" size="sm">
              Seller Resources
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CompletionStep
