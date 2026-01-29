'use client'

import React from 'react'
import { Label } from '@/components/ui/Label'
import { clsx } from 'clsx'
import {
  Sparkles,
  Ghost,
  Egg,
  Flag,
  Church,
  Music,
  Box,
  TreePine,
  Home,
  Lightbulb,
} from 'lucide-react'

interface SpecializationsStepProps {
  formData: {
    specializations: string[]
    expertiseLevel: string
    yearsExperience: number
  }
  onChange: (field: string, value: any) => void
}

const SpecializationsStep: React.FC<SpecializationsStepProps> = ({
  formData,
  onChange,
}) => {
  const specializations = [
    {
      id: 'christmas',
      name: 'Christmas',
      icon: Sparkles,
      description: 'Traditional and modern Christmas sequences',
    },
    {
      id: 'halloween',
      name: 'Halloween',
      icon: Ghost,
      description: 'Spooky and fun Halloween displays',
    },
    {
      id: 'easter',
      name: 'Easter',
      icon: Egg,
      description: 'Spring and Easter-themed sequences',
    },
    {
      id: 'patriotic',
      name: 'Patriotic',
      icon: Flag,
      description: 'July 4th, Memorial Day, and patriotic themes',
    },
    {
      id: 'religious',
      name: 'Religious',
      icon: Church,
      description: 'Faith-based and religious sequences',
    },
    {
      id: 'music_visualization',
      name: 'Music Visualization',
      icon: Music,
      description: 'Advanced beat-sync and audio-reactive effects',
    },
    {
      id: 'animated_props',
      name: 'Animated Props',
      icon: Box,
      description: 'Specialized sequences for singing faces, etc.',
    },
    {
      id: 'mega_trees',
      name: 'Mega Trees',
      icon: TreePine,
      description: 'Optimized for mega tree displays',
    },
    {
      id: 'house_outlines',
      name: 'House Outlines',
      icon: Home,
      description: 'Roof lines and house outline effects',
    },
    {
      id: 'custom_props',
      name: 'Custom Props',
      icon: Lightbulb,
      description: 'Unique and custom prop sequences',
    },
  ]

  const expertiseLevels = [
    {
      id: 'beginner',
      name: 'Beginner',
      description: 'Getting started with xLights (0-1 years)',
    },
    {
      id: 'intermediate',
      name: 'Intermediate',
      description: 'Comfortable with most features (1-3 years)',
    },
    {
      id: 'advanced',
      name: 'Advanced',
      description: 'Expert in advanced techniques (3-5 years)',
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Professional creator or instructor (5+ years)',
    },
  ]

  const toggleSpecialization = (specId: string) => {
    const current = formData.specializations
    if (current.includes(specId)) {
      onChange(
        'specializations',
        current.filter((s) => s !== specId)
      )
    } else {
      onChange('specializations', [...current, specId])
    }
  }

  return (
    <div className="space-y-6">
      {/* Accessibility: ARIA live region for selection announcements */}
      <div aria-live="polite" aria-atomic="false" className="sr-only">
        {formData.specializations.length > 0 && (
          `${formData.specializations.length} specialization${formData.specializations.length !== 1 ? 's' : ''} selected`
        )}
      </div>

      {/* Specializations */}
      <fieldset>
        <legend className="text-white mb-3 block text-base font-medium">
          What types of sequences do you create?{' '}
          <span className="text-accent" aria-label="required">*</span>
        </legend>
        <p className="text-sm text-white/60 mb-4" id="specializations-description">
          Select all that apply. This helps buyers find your sequences more easily.
        </p>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          role="group"
          aria-labelledby="specializations-description"
        >
          {specializations.map((spec) => {
            const Icon = spec.icon
            const isSelected = formData.specializations.includes(spec.id)

            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => toggleSpecialization(spec.id)}
                onKeyDown={(e) => {
                  // Accessibility: Support both Enter and Space keys
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleSpecialization(spec.id)
                  }
                }}
                className={clsx(
                  'flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
                  {
                    'border-primary bg-primary/10': isSelected,
                    'border-white/10 bg-white/5 hover:border-white/20':
                      !isSelected,
                  }
                )}
                role="checkbox"
                aria-checked={isSelected}
                aria-labelledby={`spec-${spec.id}-name`}
                aria-describedby={`spec-${spec.id}-desc`}
              >
                <div
                  className={clsx(
                    'flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center',
                    {
                      'bg-primary/20 border border-primary/30': isSelected,
                      'bg-white/5 border border-white/10': !isSelected,
                    }
                  )}
                  aria-hidden="true"
                >
                  <Icon
                    className={clsx('h-5 w-5', {
                      'text-primary': isSelected,
                      'text-white/40': !isSelected,
                    })}
                  />
                </div>
                <div className="flex-1">
                  <div
                    id={`spec-${spec.id}-name`}
                    className={clsx('font-semibold mb-0.5', {
                      'text-white': isSelected,
                      'text-white/80': !isSelected,
                    })}
                  >
                    {spec.name}
                  </div>
                  <div id={`spec-${spec.id}-desc`} className="text-xs text-white/50">
                    {spec.description}
                  </div>
                </div>
                {/* Accessibility: Screen reader announcement for selection state */}
                <span className="sr-only">
                  {isSelected ? 'Selected' : 'Not selected'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Accessibility: Error message with proper ARIA attributes */}
        {formData.specializations.length === 0 && (
          <p
            className="mt-2 text-sm text-accent/70"
            role="alert"
            aria-live="polite"
          >
            Please select at least one specialization
          </p>
        )}
      </fieldset>

      {/* Expertise Level */}
      <fieldset>
        <legend className="text-white mb-3 block text-base font-medium">
          What is your experience level? <span className="text-accent" aria-label="required">*</span>
        </legend>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          role="radiogroup"
          aria-required="true"
        >
          {expertiseLevels.map((level) => {
            const isSelected = formData.expertiseLevel === level.id

            return (
              <button
                key={level.id}
                type="button"
                onClick={() => onChange('expertiseLevel', level.id)}
                onKeyDown={(e) => {
                  // Accessibility: Support both Enter and Space keys
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onChange('expertiseLevel', level.id)
                  }
                }}
                className={clsx(
                  'p-4 rounded-xl border-2 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
                  {
                    'border-primary bg-primary/10': isSelected,
                    'border-white/10 bg-white/5 hover:border-white/20':
                      !isSelected,
                  }
                )}
                role="radio"
                aria-checked={isSelected}
                aria-labelledby={`level-${level.id}-name`}
                aria-describedby={`level-${level.id}-desc`}
              >
                <div
                  id={`level-${level.id}-name`}
                  className={clsx('font-semibold mb-1', {
                    'text-white': isSelected,
                    'text-white/80': !isSelected,
                  })}
                >
                  {level.name}
                </div>
                <div id={`level-${level.id}-desc`} className="text-sm text-white/50">
                  {level.description}
                </div>
                {/* Accessibility: Screen reader announcement for selection state */}
                <span className="sr-only">
                  {isSelected ? 'Selected' : 'Not selected'}
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Years of Experience */}
      <div>
        <Label htmlFor="years-experience" className="text-white mb-3 block">
          How many years have you been creating sequences?
        </Label>
        <div className="flex items-center gap-4">
          <input
            id="years-experience"
            type="range"
            min="0"
            max="20"
            step="1"
            value={formData.yearsExperience}
            onChange={(e) => onChange('yearsExperience', parseInt(e.target.value))}
            className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            aria-describedby="years-experience-help"
            aria-valuemin={0}
            aria-valuemax={20}
            aria-valuenow={formData.yearsExperience}
            aria-valuetext={`${formData.yearsExperience} ${formData.yearsExperience === 20 ? 'or more ' : ''}years`}
          />
          <div
            className="flex items-center justify-center min-w-[80px] h-12 px-4 rounded-lg bg-white/10 border border-white/20"
            aria-hidden="true"
          >
            <span className="text-lg font-bold text-white">
              {formData.yearsExperience}
              {formData.yearsExperience === 20 ? '+' : ''} yrs
            </span>
          </div>
        </div>
        <p id="years-experience-help" className="mt-2 text-xs text-white/50">
          This information helps set buyer expectations about your experience level.
        </p>
      </div>

      {/* Accessibility: Informational section with proper semantic structure */}
      <div
        className="p-4 rounded-lg bg-secondary/5 border border-secondary/20"
        role="region"
        aria-label="Buyer perspective information"
      >
        <p className="text-sm text-white/70">
          <strong className="text-white">Buyer Perspective:</strong> Buyers use
          specializations to filter and find sequences that match their display setup.
          Clear expertise information helps them choose the right sequences for their
          skill level.
        </p>
      </div>
    </div>
  )
}

export default SpecializationsStep
