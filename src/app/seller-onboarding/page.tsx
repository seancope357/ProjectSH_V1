'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import ProgressIndicator from '@/components/onboarding/ProgressIndicator'
import StepWrapper from '@/components/onboarding/StepWrapper'
import WelcomeStep from '@/components/onboarding/steps/WelcomeStep'
import ProfileStep from '@/components/onboarding/steps/ProfileStep'
import SpecializationsStep from '@/components/onboarding/steps/SpecializationsStep'
import PayoutStep from '@/components/onboarding/steps/PayoutStep'
import GuidelinesStep from '@/components/onboarding/steps/GuidelinesStep'
import CompletionStep from '@/components/onboarding/steps/CompletionStep'

interface OnboardingData {
  // Profile
  sellerName: string
  sellerBio: string
  sellerTagline: string
  profilePictureUrl: string
  websiteUrl: string
  facebookUrl: string
  instagramUrl: string
  youtubeUrl: string

  // Specializations
  specializations: string[]
  expertiseLevel: string
  yearsExperience: number

  // Payout
  stripeAccountId: string
  stripeAccountStatus: string

  // Guidelines
  acceptedTerms: boolean
  acceptedQualityStandards: boolean
  acceptedCommunityGuidelines: boolean
  marketingConsent: boolean
  newsletterConsent: boolean
}

const steps = [
  {
    id: 1,
    name: 'Welcome',
    description: 'Get started',
    required: true,
  },
  {
    id: 2,
    name: 'Profile',
    description: 'Your seller identity',
    required: true,
  },
  {
    id: 3,
    name: 'Specializations',
    description: 'What you create',
    required: true,
  },
  {
    id: 4,
    name: 'Payout Setup',
    description: 'Get paid',
    required: false,
  },
  {
    id: 5,
    name: 'Guidelines',
    description: 'Rules & standards',
    required: true,
  },
  {
    id: 6,
    name: 'Complete',
    description: 'You are ready!',
    required: true,
  },
]

export default function SellerOnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>('')

  const [formData, setFormData] = useState<OnboardingData>({
    sellerName: '',
    sellerBio: '',
    sellerTagline: '',
    profilePictureUrl: '',
    websiteUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    specializations: [],
    expertiseLevel: '',
    yearsExperience: 0,
    stripeAccountId: '',
    stripeAccountStatus: 'not_started',
    acceptedTerms: false,
    acceptedQualityStandards: false,
    acceptedCommunityGuidelines: false,
    marketingConsent: false,
    newsletterConsent: false,
  })

  // Load existing data on mount
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/seller-onboarding')
      return
    }

    loadOnboardingData()
  }, [user])

  // Handle Stripe Connect callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stripeStatus = params.get('stripe')
    const stripeError = params.get('error')
    const stripeMessage = params.get('message')
    const accountStatus = params.get('status')

    if (stripeStatus === 'connected' && accountStatus) {
      // Successfully connected Stripe account
      setFormData((prev) => ({
        ...prev,
        stripeAccountStatus: accountStatus,
      }))

      // Clear the URL parameters
      window.history.replaceState({}, '', '/seller-onboarding')

      // Show success message based on status
      if (accountStatus === 'active') {
        setError('')
        // Account is fully active, move to step 4 if not already there
        if (currentStep < 4) {
          setCurrentStep(4)
        }
      } else if (accountStatus === 'pending') {
        setError('')
      }
    } else if (stripeStatus === 'error' && stripeError) {
      // Handle Stripe connection error
      setError(stripeError)
      window.history.replaceState({}, '', '/seller-onboarding')
    } else if (stripeStatus === 'cancelled' && stripeMessage) {
      // User cancelled the connection
      setError(stripeMessage)
      window.history.replaceState({}, '', '/seller-onboarding')
    }
  }, [])

  const loadOnboardingData = async () => {
    try {
      setIsLoading(true)

      // Initialize seller onboarding if needed
      const { error: initError } = await supabase.rpc('initialize_seller_onboarding')
      if (initError) throw initError

      // Load seller profile
      const { data: sellerProfile, error: profileError } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      // Load onboarding progress
      const { data: progress, error: progressError } = await supabase
        .from('seller_onboarding_progress')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError
      }

      // Populate form data
      if (sellerProfile) {
        setFormData((prev) => ({
          ...prev,
          sellerName: sellerProfile.seller_name || '',
          sellerBio: sellerProfile.seller_bio || '',
          sellerTagline: sellerProfile.seller_tagline || '',
          profilePictureUrl: sellerProfile.profile_picture_url || '',
          websiteUrl: sellerProfile.website_url || '',
          facebookUrl: sellerProfile.facebook_url || '',
          instagramUrl: sellerProfile.instagram_url || '',
          youtubeUrl: sellerProfile.youtube_url || '',
          specializations: sellerProfile.specializations || [],
          expertiseLevel: sellerProfile.expertise_level || '',
          yearsExperience: sellerProfile.years_experience || 0,
          stripeAccountId: sellerProfile.stripe_account_id || '',
          stripeAccountStatus: sellerProfile.stripe_account_status || 'not_started',
          marketingConsent: sellerProfile.marketing_consent || false,
          newsletterConsent: sellerProfile.newsletter_consent || false,
        }))
      }

      // Set current step and completed steps from progress
      if (progress) {
        setCurrentStep(progress.current_step || 1)

        const completed: number[] = []
        if (progress.step_welcome_completed) completed.push(1)
        if (progress.step_profile_completed) completed.push(2)
        if (progress.step_specializations_completed) completed.push(3)
        if (progress.step_payout_completed) completed.push(4)
        if (progress.step_guidelines_completed) completed.push(5)
        if (progress.is_completed) completed.push(6)

        setCompletedSteps(completed)

        // If already completed, redirect to dashboard
        if (progress.is_completed) {
          router.push('/seller-dashboard')
          return
        }
      }
    } catch (err) {
      console.error('Error loading onboarding data:', err)
      setError('Failed to load onboarding data. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleUploadProfilePicture = async (file: File) => {
    if (!user) return

    try {
      setIsUploading(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `profile-pictures/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      handleFieldChange('profilePictureUrl', publicUrl)

      // Save to database immediately
      await supabase
        .from('seller_profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', user.id)
    } catch (err) {
      console.error('Error uploading profile picture:', err)
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  const saveProgress = async (stepId: number) => {
    if (!user) return

    try {
      setIsSaving(true)

      // Update seller profile
      const { error: profileError } = await supabase
        .from('seller_profiles')
        .update({
          seller_name: formData.sellerName,
          seller_bio: formData.sellerBio,
          seller_tagline: formData.sellerTagline,
          profile_picture_url: formData.profilePictureUrl,
          website_url: formData.websiteUrl,
          facebook_url: formData.facebookUrl,
          instagram_url: formData.instagramUrl,
          youtube_url: formData.youtubeUrl,
          specializations: formData.specializations,
          expertise_level: formData.expertiseLevel,
          years_experience: formData.yearsExperience,
          marketing_consent: formData.marketingConsent,
          newsletter_consent: formData.newsletterConsent,
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update onboarding progress
      const progressUpdate: any = {
        current_step: stepId,
        last_active_step: stepId,
      }

      if (stepId === 1) progressUpdate.step_welcome_completed = true
      if (stepId === 2) progressUpdate.step_profile_completed = true
      if (stepId === 3) progressUpdate.step_specializations_completed = true
      if (stepId === 4) progressUpdate.step_payout_completed = true
      if (stepId === 5) progressUpdate.step_guidelines_completed = true

      const { error: progressError } = await supabase
        .from('seller_onboarding_progress')
        .update(progressUpdate)
        .eq('id', user.id)

      if (progressError) throw progressError

      // Mark step as completed
      if (!completedSteps.includes(stepId)) {
        setCompletedSteps([...completedSteps, stepId])
      }
    } catch (err) {
      console.error('Error saving progress:', err)
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async () => {
    try {
      setError('')

      // Validate current step
      if (!validateCurrentStep()) {
        return
      }

      // Save progress
      await saveProgress(currentStep)

      // Move to next step
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1)
      }
    } catch (err) {
      setError('Failed to save progress. Please try again.')
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = async () => {
    try {
      // Only step 4 (Payout) is skippable
      if (currentStep === 4) {
        await saveProgress(currentStep)
        setCurrentStep(currentStep + 1)
      }
    } catch (err) {
      setError('Failed to skip step. Please try again.')
    }
  }

  const handleComplete = async () => {
    if (!user) return

    try {
      setIsSaving(true)

      // Complete onboarding
      const { error } = await supabase.rpc('complete_seller_onboarding')
      if (error) throw error

      // Redirect to dashboard
      router.push('/seller-dashboard')
    } catch (err) {
      console.error('Error completing onboarding:', err)
      setError('Failed to complete onboarding. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return true // Welcome step has no validation

      case 2:
        if (!formData.sellerName.trim()) {
          setError('Please enter your seller name')
          return false
        }
        return true

      case 3:
        if (formData.specializations.length === 0) {
          setError('Please select at least one specialization')
          return false
        }
        if (!formData.expertiseLevel) {
          setError('Please select your expertise level')
          return false
        }
        return true

      case 4:
        // Payout is optional, always valid
        return true

      case 5:
        if (
          !formData.acceptedTerms ||
          !formData.acceptedQualityStandards ||
          !formData.acceptedCommunityGuidelines
        ) {
          setError('Please accept all required agreements to continue')
          return false
        }
        return true

      default:
        return true
    }
  }

  const handleConnectStripe = async () => {
    try {
      setError('')
      setIsSaving(true)

      // Call our API to initiate Stripe Connect OAuth flow
      const response = await fetch('/api/stripe/connect', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate Stripe connection')
      }

      // Redirect to Stripe Connect OAuth page
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No authorization URL received from server')
      }
    } catch (err: any) {
      console.error('Error connecting to Stripe:', err)
      setError(err.message || 'Failed to connect to Stripe. Please try again.')
      setIsSaving(false)
    }
  }

  const handleRefreshStripeStatus = async () => {
    try {
      const response = await fetch('/api/stripe/connect/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Stripe status')
      }

      // Update form data with new status
      setFormData((prev) => ({
        ...prev,
        stripeAccountStatus: data.status,
      }))

      // Update seller profile in database
      await supabase
        .from('seller_profiles')
        .update({
          stripe_account_status: data.status,
          stripe_charges_enabled: data.chargesEnabled,
          stripe_payouts_enabled: data.payoutsEnabled,
        })
        .eq('id', user?.id)

      return data
    } catch (err: any) {
      console.error('Error refreshing Stripe status:', err)
      throw err
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary mb-4" />
          <p className="text-white/70">Loading your seller profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <ProgressIndicator
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 && (
          <StepWrapper
            title="Welcome to SequenceHUB"
            description="Let's get you set up as a seller in just a few minutes"
            currentStep={currentStep}
            totalSteps={steps.length}
            onNext={handleNext}
            isNextLoading={isSaving}
            nextLabel="Let's Get Started"
          >
            <WelcomeStep />
          </StepWrapper>
        )}

        {currentStep === 2 && (
          <StepWrapper
            title="Create Your Seller Profile"
            description="Tell buyers who you are and what makes your sequences special"
            currentStep={currentStep}
            totalSteps={steps.length}
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!formData.sellerName.trim()}
            isNextLoading={isSaving}
          >
            <ProfileStep
              formData={formData}
              onChange={handleFieldChange}
              onUploadProfilePicture={handleUploadProfilePicture}
              isUploading={isUploading}
            />
          </StepWrapper>
        )}

        {currentStep === 3 && (
          <StepWrapper
            title="Your Specializations"
            description="Help buyers discover your sequences"
            currentStep={currentStep}
            totalSteps={steps.length}
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={
              formData.specializations.length === 0 || !formData.expertiseLevel
            }
            isNextLoading={isSaving}
          >
            <SpecializationsStep formData={formData} onChange={handleFieldChange} />
          </StepWrapper>
        )}

        {currentStep === 4 && (
          <StepWrapper
            title="Set Up Payouts"
            description="Connect your payment account to receive earnings"
            currentStep={currentStep}
            totalSteps={steps.length}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
            showSkip={formData.stripeAccountStatus !== 'active'}
            isNextLoading={isSaving}
            nextLabel={
              formData.stripeAccountStatus === 'active' ? 'Continue' : 'Skip for Now'
            }
          >
            <PayoutStep
              stripeAccountStatus={formData.stripeAccountStatus}
              onConnectStripe={handleConnectStripe}
              isConnecting={isSaving}
              onStatusRefresh={handleRefreshStripeStatus}
            />
          </StepWrapper>
        )}

        {currentStep === 5 && (
          <StepWrapper
            title="Community Guidelines"
            description="Review and accept our standards for sellers"
            currentStep={currentStep}
            totalSteps={steps.length}
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={
              !formData.acceptedTerms ||
              !formData.acceptedQualityStandards ||
              !formData.acceptedCommunityGuidelines
            }
            isNextLoading={isSaving}
            nextLabel="Complete Setup"
          >
            <GuidelinesStep formData={formData} onChange={handleFieldChange} />
          </StepWrapper>
        )}

        {currentStep === 6 && (
          <StepWrapper
            title="Setup Complete!"
            description="You are ready to start selling on SequenceHUB"
            currentStep={currentStep}
            totalSteps={steps.length}
            onBack={handleBack}
          >
            <CompletionStep
              sellerName={formData.sellerName}
              onGoToDashboard={handleComplete}
            />
          </StepWrapper>
        )}
      </div>
    </div>
  )
}
