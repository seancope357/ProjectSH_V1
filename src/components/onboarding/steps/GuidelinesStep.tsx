'use client'

import React from 'react'
import { Label } from '@/components/ui/Label'
import {
  ShieldCheck,
  FileCheck,
  Scale,
  Users,
  Star,
  AlertTriangle,
} from 'lucide-react'

interface GuidelinesStepProps {
  formData: {
    acceptedTerms: boolean
    acceptedQualityStandards: boolean
    acceptedCommunityGuidelines: boolean
    marketingConsent: boolean
    newsletterConsent: boolean
  }
  onChange: (field: string, value: boolean) => void
}

const GuidelinesStep: React.FC<GuidelinesStepProps> = ({ formData, onChange }) => {
  const guidelines = [
    {
      icon: FileCheck,
      title: 'Quality Standards',
      items: [
        'All sequences must be original work or properly licensed',
        'Minimum 30 seconds duration for paid sequences',
        'Include accurate metadata (song info, props used, duration)',
        'Provide clear preview videos when possible',
        'Test sequences before uploading to ensure they work correctly',
      ],
    },
    {
      icon: Scale,
      title: 'Legal Requirements',
      items: [
        'You own the rights to sell the sequences you upload',
        'Music used must be properly licensed or royalty-free',
        'No copyrighted material without proper authorization',
        'Respect intellectual property rights of others',
        'Comply with all applicable laws and regulations',
      ],
    },
    {
      icon: Users,
      title: 'Community Guidelines',
      items: [
        'Treat all buyers and sellers with respect and professionalism',
        'Respond to customer questions within 48 hours when possible',
        'Provide accurate descriptions - no misleading information',
        'Honor refund policy for technical issues',
        'Report inappropriate content or behavior to moderators',
      ],
    },
    {
      icon: Star,
      title: 'Best Practices',
      items: [
        'Use clear, descriptive titles that help buyers find your work',
        'Include detailed descriptions of props, effects, and requirements',
        'Price fairly based on complexity and market standards',
        'Regularly update and improve your sequences',
        'Engage with the community and learn from feedback',
      ],
    },
  ]

  const checkboxes = [
    {
      id: 'acceptedTerms',
      label: 'I agree to the Terms of Service and Seller Agreement',
      labelWithLinks: (
        <>
          I agree to the{' '}
          <a
            href="/legal/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline"
            onClick={(e) => e.stopPropagation()}
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="/legal/seller-agreement"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline"
            onClick={(e) => e.stopPropagation()}
          >
            Seller Agreement
          </a>
        </>
      ),
      required: true,
    },
    {
      id: 'acceptedQualityStandards',
      label: 'I understand and will follow the Quality Standards',
      labelWithLinks: (
        <>
          I understand and will follow the{' '}
          <a
            href="/legal/community-guidelines#2-quality-standards-for-sequences"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline"
            onClick={(e) => e.stopPropagation()}
          >
            Quality Standards
          </a>
        </>
      ),
      required: true,
    },
    {
      id: 'acceptedCommunityGuidelines',
      label: 'I agree to abide by the Community Guidelines',
      labelWithLinks: (
        <>
          I agree to abide by the{' '}
          <a
            href="/legal/community-guidelines"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline"
            onClick={(e) => e.stopPropagation()}
          >
            Community Guidelines
          </a>
        </>
      ),
      required: true,
    },
    {
      id: 'marketingConsent',
      label: 'I consent to receiving seller updates and tips (optional)',
      required: false,
    },
    {
      id: 'newsletterConsent',
      label: 'Subscribe to the SequenceHUB newsletter for marketplace news (optional)',
      required: false,
    },
  ]

  const allRequiredAccepted =
    formData.acceptedTerms &&
    formData.acceptedQualityStandards &&
    formData.acceptedCommunityGuidelines

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div
          className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-4"
          role="img"
          aria-label="Shield with checkmark"
        >
          <ShieldCheck className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Community Guidelines & Standards
        </h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          To maintain a high-quality marketplace that benefits both sellers and buyers,
          please review and accept our guidelines.
        </p>
      </div>

      {/* Guidelines Grid */}
      <div className="grid gap-4 md:grid-cols-2" role="list" aria-label="Marketplace guidelines">
        {guidelines.map((section, index) => {
          const Icon = section.icon
          return (
            <section
              key={index}
              className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all duration-300"
              role="listitem"
              aria-labelledby={`guideline-${index}-title`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20"
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 id={`guideline-${index}-title`} className="font-semibold text-white">
                  {section.title}
                </h3>
              </div>
              <ul className="space-y-2" aria-label={`${section.title} items`}>
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex gap-2 text-sm text-white/70">
                    <span className="text-primary mt-1" aria-hidden="true">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      {/* Important Notice */}
      <div
        className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30"
        role="alert"
        aria-labelledby="important-notice-title"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 id="important-notice-title" className="font-semibold text-white mb-2">
              Important Notice
            </h3>
            <p className="text-sm text-white/70 mb-3">
              Violations of these guidelines may result in:
            </p>
            <ul className="space-y-1 text-sm text-white/70">
              <li className="flex gap-2">
                <span className="text-amber-400" aria-hidden="true">•</span>
                Sequence removal or account suspension
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400" aria-hidden="true">•</span>
                Loss of seller privileges
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400" aria-hidden="true">•</span>
                Withheld payments for fraudulent activity
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Acceptance Checkboxes */}
      <fieldset className="pt-4 border-t border-white/10 space-y-4">
        <legend className="font-semibold text-white mb-4">
          Required Agreements
        </legend>

        {checkboxes.map((checkbox) => (
          <div key={checkbox.id} className="flex items-start gap-3">
            <div className="flex-shrink-0 pt-0.5">
              <input
                type="checkbox"
                id={checkbox.id}
                checked={formData[checkbox.id as keyof typeof formData] as boolean}
                onChange={(e) => onChange(checkbox.id, e.target.checked)}
                className="h-5 w-5 rounded border-white/20 bg-white/5 text-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-0 focus:ring-offset-background cursor-pointer"
                aria-required={checkbox.required}
                aria-describedby={`${checkbox.id}-label`}
              />
            </div>
            <label
              id={`${checkbox.id}-label`}
              htmlFor={checkbox.id}
              className="text-sm text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              {(checkbox as any).labelWithLinks || checkbox.label}
              {checkbox.required && (
                <span className="text-accent ml-1" aria-label="required">*</span>
              )}
            </label>
          </div>
        ))}
      </fieldset>

      {/* Accessibility: Error/validation message with proper ARIA attributes */}
      {!allRequiredAccepted && (
        <div
          className="p-4 rounded-lg bg-accent/10 border border-accent/30"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-white/70">
            Please accept all required agreements (marked with{' '}
            <span className="text-accent">*</span>) to continue.
          </p>
        </div>
      )}

      {/* Accessibility: Success message when all required items are accepted */}
      {allRequiredAccepted && (
        <div className="sr-only" aria-live="polite" role="status">
          All required agreements have been accepted. You may continue.
        </div>
      )}

      {/* Accessibility: Informational section with proper semantic structure */}
      <div
        className="p-4 rounded-lg bg-primary/5 border border-primary/20"
        role="region"
        aria-label="Buyer perspective information"
      >
        <p className="text-sm text-white/70">
          <strong className="text-white">Buyer Perspective:</strong> These guidelines
          ensure that buyers receive high-quality, legitimate sequences and have a
          positive experience. Following these standards builds trust and leads to
          better reviews and repeat customers.
        </p>
      </div>
    </div>
  )
}

export default GuidelinesStep
