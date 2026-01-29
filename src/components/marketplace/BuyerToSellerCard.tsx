'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Zap, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { clsx } from 'clsx'

interface BuyerToSellerCardProps {
  className?: string
}

const BuyerToSellerCard: React.FC<BuyerToSellerCardProps> = ({ className = '' }) => {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Turn time into income',
      description: 'Your sequences are valuable',
    },
    {
      icon: DollarSign,
      title: '90% revenue share',
      description: 'You keep most of what you earn',
    },
    {
      icon: Zap,
      title: 'Zero hassle sales',
      description: 'We handle everything',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className={clsx('col-span-1 sm:col-span-2', className)}
    >
      <Card className="relative overflow-hidden border-2 border-transparent bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500">
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 opacity-30 blur-sm" />
        <div className="absolute inset-0.5 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800" />

        {/* Content */}
        <CardContent className="relative p-8 sm:p-10 space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-3">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: 'loop',
              }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30 mb-2"
            >
              <DollarSign className="w-8 h-8 text-white" />
            </motion.div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Have Sequences Collecting Dust?
            </h3>

            <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto">
              Join{' '}
              <span className="text-amber-400 font-semibold">1,234 creators</span>{' '}
              earning{' '}
              <span className="text-amber-400 font-semibold">$2,400/year</span> on
              average
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 py-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex flex-col items-center text-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">
                      {benefit.title}
                    </p>
                    <p className="text-xs text-gray-400">{benefit.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <a href="/become-seller" className="block">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:via-orange-400 hover:to-yellow-400 text-gray-900 font-bold border-none shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 group"
              >
                See How Much You Could Earn
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>

          {/* Trust Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 border-2 border-gray-900"
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">
              <span className="text-amber-400 font-semibold">234</span> creators
              joined this week
            </p>
          </div>
        </CardContent>

        {/* Decorative elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'loop',
          }}
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full blur-3xl opacity-20 -z-10"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: 'loop',
          }}
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-yellow-500 to-amber-500 rounded-full blur-3xl opacity-20 -z-10"
        />
      </Card>
    </motion.div>
  )
}

export default BuyerToSellerCard
