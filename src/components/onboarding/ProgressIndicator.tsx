'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { clsx } from 'clsx'

interface Step {
  id: number
  name: string
  description: string
  required: boolean
}

interface ProgressIndicatorProps {
  steps: Step[]
  currentStep: number
  completedSteps: number[]
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps,
}) => {
  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'completed'
    if (stepId === currentStep) return 'current'
    if (stepId < currentStep) return 'upcoming'
    return 'upcoming'
  }

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, stepIdx) => {
          const status = getStepStatus(step.id)
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = step.id === currentStep

          return (
            <li key={step.id} className="md:flex-1">
              <div
                className={clsx(
                  'group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4',
                  {
                    'border-primary': isCurrent,
                    'border-primary/50': isCompleted,
                    'border-white/10': !isCurrent && !isCompleted,
                  }
                )}
              >
                <span
                  className={clsx('text-sm font-medium transition-colors', {
                    'text-primary': isCurrent,
                    'text-white': isCompleted,
                    'text-white/50': !isCurrent && !isCompleted,
                  })}
                >
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-4 w-4 text-background" />
                      </span>
                    ) : (
                      <span
                        className={clsx(
                          'flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold',
                          {
                            'border-primary bg-primary/10 text-primary': isCurrent,
                            'border-white/20 bg-white/5 text-white/50':
                              !isCurrent && !isCompleted,
                          }
                        )}
                      >
                        {step.id}
                      </span>
                    )}
                    <span>{step.name}</span>
                    {step.required && !isCompleted && (
                      <span className="text-accent text-xs">*</span>
                    )}
                  </div>
                </span>
                <span
                  className={clsx('mt-1 text-sm transition-colors', {
                    'text-white/70': isCurrent,
                    'text-white/50': !isCurrent,
                  })}
                >
                  {step.description}
                </span>
              </div>
              {stepIdx !== steps.length - 1 && (
                <div
                  className="absolute left-4 top-4 -ml-px mt-0.5 hidden h-full w-0.5 bg-white/10 md:block"
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>
            Step {currentStep} of {steps.length}
          </span>
          <span>
            {Math.round((completedSteps.length / steps.length) * 100)}% complete
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{
              width: `${(completedSteps.length / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </nav>
  )
}

export default ProgressIndicator
