'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import {
  Sparkles,
  DollarSign,
  Users,
  Shield,
  TrendingUp,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'

export default function BecomeSellerPage() {
  const { user } = useAuth()
  const router = useRouter()

  // If user is already logged in, redirect to onboarding
  useEffect(() => {
    if (user) {
      router.push('/seller-onboarding')
    }
  }, [user, router])

  const benefits = [
    {
      icon: DollarSign,
      title: 'Earn Money Doing What You Love',
      description:
        'Turn your xLights sequence creation skills into a steady income stream. Set your own prices and keep 90% of every sale.',
    },
    {
      icon: Users,
      title: 'Reach Thousands of Buyers',
      description:
        'Access a growing marketplace of enthusiasts actively looking for quality sequences. Your work deserves to be seen.',
    },
    {
      icon: Shield,
      title: 'Secure & Hassle-Free',
      description:
        'We handle payments, delivery, and customer support. You focus on creating amazing sequences.',
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Brand',
      description:
        'Build a following, get reviews, and establish yourself as a trusted creator in the xLights community.',
    },
  ]

  const features = [
    'Automated payment processing through Stripe',
    'Instant digital delivery to customers',
    'Built-in analytics and sales tracking',
    'Professional seller dashboard',
    'Marketing and promotional tools',
    'Community support and resources',
  ]

  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      description: 'Sign up and complete our simple seller onboarding process.',
    },
    {
      number: 2,
      title: 'Upload Your Sequences',
      description: 'Add your sequences with descriptions, previews, and pricing.',
    },
    {
      number: 3,
      title: 'Start Earning',
      description: 'Get paid automatically when customers purchase your work.',
    },
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Become a SequenceHUB Seller
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
              Join hundreds of sequence creators earning money by sharing their xLights
              sequences with enthusiasts around the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login?redirect=/seller-onboarding">
                <Button size="lg" className="gap-2 min-w-[200px]">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline" className="min-w-[200px]">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid gap-8 md:grid-cols-2 mb-16">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card key={index} className="hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                          <Icon className="h-7 w-7 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-white/60">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              How It Works
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 border-2 border-primary mb-4">
                    <span className="text-2xl font-bold text-primary">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-white/60">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Features List */}
          <Card className="mb-16">
            <CardHeader>
              <h2 className="text-2xl font-bold text-white">
                Everything You Need to Succeed
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to Start Selling?
                </h2>
                <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                  Join SequenceHUB today and start earning from your sequence creations.
                  Setup takes less than 10 minutes.
                </p>
                <Link href="/login?redirect=/seller-onboarding">
                  <Button size="lg" className="gap-2">
                    Start Your Seller Journey
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <p className="mt-4 text-sm text-white/50">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}