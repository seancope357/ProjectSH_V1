'use client'

import React, { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { CreditCard, Shield, DollarSign, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface PayoutStepProps {
  stripeAccountStatus: string
  onConnectStripe: () => void
  isConnecting: boolean
  onStatusRefresh?: () => void
}

const PayoutStep: React.FC<PayoutStepProps> = ({
  stripeAccountStatus,
  onConnectStripe,
  isConnecting,
  onStatusRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isConnected = stripeAccountStatus === 'active'
  const isPending = stripeAccountStatus === 'pending'
  const isNotStarted = stripeAccountStatus === 'not_started'
  const isRestricted = stripeAccountStatus === 'restricted'

  // Handle status refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    setErrorMessage(null)

    try {
      if (onStatusRefresh) {
        await onStatusRefresh()
      }
    } catch (error) {
      console.error('Failed to refresh status:', error)
      setErrorMessage('Failed to refresh status. Please try again.')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
          <CreditCard className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Set Up Your Payout Account
        </h3>
        <p className="text-white/70 max-w-2xl mx-auto">
          Connect with Stripe to receive payments securely. Stripe is trusted by
          millions of businesses worldwide.
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-400">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Display */}
      {isConnected && (
        <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">
                Payment Account Connected
              </h4>
              <p className="text-sm text-white/70">
                Your Stripe account is active and ready to receive payments. You can
                manage your payout settings in the Stripe Dashboard.
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="sm"
              variant="ghost"
              className="flex-shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      )}

      {isPending && (
        <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">
                Account Setup In Progress
              </h4>
              <p className="text-sm text-white/70">
                Your Stripe account is being verified. This usually takes 1-2 business
                days. You will receive an email when verification is complete.
              </p>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-sm text-yellow-400 hover:text-yellow-300 underline mt-2 disabled:opacity-50"
              >
                {isRefreshing ? 'Checking status...' : 'Check status now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isRestricted && (
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">
                Account Restricted
              </h4>
              <p className="text-sm text-white/70 mb-2">
                Your Stripe account has been restricted. This may be due to missing
                information or verification issues. Please complete any outstanding
                requirements in your Stripe Dashboard.
              </p>
              <Button
                onClick={onConnectStripe}
                disabled={isConnecting}
                size="sm"
                variant="outline"
                className="mt-2"
              >
                {isConnecting ? 'Opening...' : 'Resolve in Stripe Dashboard'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Benefits */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-white text-sm">Secure & Safe</h4>
          </div>
          <p className="text-xs text-white/60">
            Bank-level security with PCI compliance. Your financial data is protected.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-white text-sm">Fast Payouts</h4>
          </div>
          <p className="text-xs text-white/60">
            Get paid within 2-7 business days after a sale. Choose daily, weekly, or
            monthly transfers.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-white text-sm">Easy Setup</h4>
          </div>
          <p className="text-xs text-white/60">
            Simple 5-minute setup process. No complex paperwork or lengthy approvals.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <h4 className="font-semibold text-white mb-3">How Payouts Work</h4>
        <ol className="space-y-3">
          <li className="flex gap-3">
            <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary text-sm font-bold">
              1
            </span>
            <div className="text-sm text-white/70">
              <strong className="text-white">Customer purchases</strong> - We process
              the payment securely through Stripe
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary text-sm font-bold">
              2
            </span>
            <div className="text-sm text-white/70">
              <strong className="text-white">Platform fee deducted</strong> - We keep a
              small fee to maintain the platform (10%)
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary text-sm font-bold">
              3
            </span>
            <div className="text-sm text-white/70">
              <strong className="text-white">You get paid</strong> - Remaining amount
              transfers to your bank account automatically
            </div>
          </li>
        </ol>
      </div>

      {/* Connect Button */}
      {isNotStarted && (
        <div className="flex flex-col items-center gap-4 py-6">
          <Button
            onClick={onConnectStripe}
            disabled={isConnecting}
            size="lg"
            className="gap-2 min-w-[200px]"
          >
            {isConnecting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Connecting...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Connect with Stripe
              </>
            )}
          </Button>
          <p className="text-xs text-white/50 max-w-md text-center">
            You will be redirected to Stripe to complete the setup. This is required
            before you can start selling sequences.
          </p>
        </div>
      )}

      {isPending && (
        <div className="flex flex-col items-center gap-4 py-6">
          <Button
            onClick={onConnectStripe}
            disabled={isConnecting}
            size="lg"
            variant="outline"
            className="gap-2 min-w-[200px]"
          >
            <CreditCard className="h-5 w-5" />
            Continue Setup in Stripe
          </Button>
          <p className="text-xs text-white/50 max-w-md text-center">
            Complete any remaining steps in your Stripe account dashboard.
          </p>
        </div>
      )}

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm text-white/70">
          <strong className="text-white">Note:</strong> You can skip this step and
          complete it later, but you will not be able to publish sequences for sale
          until your payout account is connected and verified.
        </p>
      </div>
    </div>
  )
}

export default PayoutStep
