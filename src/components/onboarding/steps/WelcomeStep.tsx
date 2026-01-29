'use client'

import React from 'react'
import { Sparkles, TrendingUp, Users, Zap } from 'lucide-react'

const WelcomeStep: React.FC = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Reach Thousands of Buyers',
      description:
        'Connect with xLights enthusiasts worldwide looking for high-quality sequences.',
    },
    {
      icon: Zap,
      title: 'Automated Everything',
      description:
        'We handle payments, delivery, and customer support so you can focus on creating.',
    },
    {
      icon: Users,
      title: 'Join a Thriving Community',
      description:
        'Be part of a growing marketplace of talented sequence creators and passionate buyers.',
    },
    {
      icon: Sparkles,
      title: 'Get Paid Quickly',
      description:
        'Fast, secure payouts through Stripe. Your earnings, your way.',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4 py-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome to SequenceHUB Seller Platform
        </h3>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          You are about to join a marketplace that empowers xLights creators to turn
          their passion into profit. Let us show you what makes SequenceHUB special.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 pt-4">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon
          return (
            <div
              key={index}
              className="flex gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
                <p className="text-sm text-white/60">{benefit.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Setup Process
        </h4>
        <p className="text-sm text-white/70">
          This onboarding takes just 5-10 minutes. We will guide you through setting up
          your seller profile, connecting your payment account, and understanding our
          community guidelines. You can save your progress and return anytime.
        </p>
      </div>
    </div>
  )
}

export default WelcomeStep
