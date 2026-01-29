'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface StepWrapperProps {
  title: string
  description: string
  children: React.ReactNode
  onNext?: () => void
  onBack?: () => void
  onSkip?: () => void
  nextLabel?: string
  backLabel?: string
  skipLabel?: string
  isNextDisabled?: boolean
  isNextLoading?: boolean
  showSkip?: boolean
  currentStep: number
  totalSteps: number
}

const StepWrapper: React.FC<StepWrapperProps> = ({
  title,
  description,
  children,
  onNext,
  onBack,
  onSkip,
  nextLabel = 'Continue',
  backLabel = 'Back',
  skipLabel = 'Skip for now',
  isNextDisabled = false,
  isNextLoading = false,
  showSkip = false,
  currentStep,
  totalSteps,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <span className="text-sm text-white/50">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <p className="text-white/70">{description}</p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {children}

          <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/8">
            <div>
              {onBack && currentStep > 1 && (
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="gap-2"
                  disabled={isNextLoading}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {backLabel}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {showSkip && onSkip && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  disabled={isNextLoading}
                >
                  {skipLabel}
                </Button>
              )}
              {onNext && (
                <Button
                  onClick={onNext}
                  disabled={isNextDisabled || isNextLoading}
                  className="gap-2"
                >
                  {isNextLoading ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {nextLabel}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StepWrapper
