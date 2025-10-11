'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Navigation } from '@/components/ui/navigation'
import { useAuth } from '@/components/providers/session-provider'
import {
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  User,
  Globe,
  FileText,
} from 'lucide-react'

type Step = 1 | 2 | 3 | 4 | 5

export default function SellerOnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [profile, setProfile] = useState({
    full_name: '' as string,
    username: '' as string,
    avatar_url: '' as string,
    bio: '' as string,
    website_url: '' as string,
    stripe_onboarding_complete: false,
  })

  useEffect(() => {
    if (!user) return
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/user/setup-profile', { method: 'GET' })
        const data = await res.json()
        if (res.ok && data?.profile) {
          setProfile(prev => ({ ...prev, ...data.profile }))
        }
      } catch (e) {
        // ignore load errors, start with blank
      }
    }
    loadProfile()
  }, [user])

  const clampStep = (n: number): Step => Math.min(5, Math.max(1, n)) as Step
  const nextStep = () => setStep(s => clampStep(s + 1))
  const prevStep = () => setStep(s => clampStep(s - 1))

  const triggerAvatarSelect = () => fileInputRef.current?.click()

  const handleAvatarSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setAvatarUploading(true)
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: form,
      })
      const json = await res.json()
      if (!res.ok) {
        alert(json?.error || 'Failed to upload avatar')
        return
      }
      const url = json?.avatarUrl || ''
      setProfile(prev => ({ ...prev, avatar_url: url }))
    } catch (err) {
      alert('Failed to upload avatar')
    } finally {
      setAvatarUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const completeStripe = () => {
    // Placeholder for Stripe onboarding flow
    setProfile(p => ({ ...p, stripe_onboarding_complete: true }))
  }

  const handleFinish = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/user/setup-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error || 'Failed to save profile')
        setSaving(false)
        return
      }
      router.replace('/seller/dashboard')
    } catch (e) {
      setError('Unexpected error saving profile')
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    { id: 1, label: 'Basic Info' },
    { id: 2, label: 'Profile Photo' },
    { id: 3, label: 'Seller Details' },
    { id: 4, label: 'Payout Setup' },
    { id: 5, label: 'Review' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Seller Onboarding
          </h1>
          <p className="mt-1 text-gray-600">
            Complete your profile to access the seller dashboard.
          </p>
        </div>
      </section>

      {/* Progress */}
      <nav className="bg-white sticky top-0 z-30 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="grid grid-cols-5 gap-2">
            {steps.map(s => (
              <div
                key={s.id}
                className={`text-center px-3 py-2 rounded-lg text-sm ${step >= s.id ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <section className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Basic Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={e =>
                    setProfile(p => ({ ...p, full_name: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={e =>
                    setProfile(p => ({ ...p, username: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Choose a unique username"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <Link href="/" className="text-gray-600 flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
              <button
                onClick={nextStep}
                disabled={!profile.full_name || !profile.username}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {/* Step 2: Profile Photo */}
        {step === 2 && (
          <section className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Profile Photo</h2>
            </div>
            <div className="text-center">
              <div className="relative inline-block">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Avatar"
                    width={120}
                    height={120}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-30 h-30 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {profile.full_name
                      ? profile.full_name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                      : '👤'}
                  </div>
                )}
                <button
                  onClick={() => triggerAvatarSelect()}
                  disabled={avatarUploading}
                  className="absolute -bottom-2 -right-2 bg-gray-100 rounded-full p-2 hover:bg-gray-200 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4 text-gray-700" />
                </button>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleAvatarSelected}
                />
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Upload a clear square image. Recommended size: 256×256.
              </p>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={prevStep}
                className="text-gray-600 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={nextStep}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Seller Details */}
        {step === 3 && (
          <section className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Seller Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={e =>
                    setProfile(p => ({ ...p, bio: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Tell buyers about your experience, tools, and styles."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <input
                    type="url"
                    value={profile.website_url}
                    onChange={e =>
                      setProfile(p => ({ ...p, website_url: e.target.value }))
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://your-portfolio.com"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={prevStep}
                className="text-gray-600 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={nextStep}
                disabled={!profile.bio}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {/* Step 4: Payout Setup */}
        {step === 4 && (
          <section className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Payout Setup</h2>
            </div>
            <p className="text-gray-600">
              Connect your Stripe account to receive payouts.
            </p>
            <div className="mt-4">
              <button
                onClick={completeStripe}
                className={`px-4 py-2 rounded-lg font-medium ${profile.stripe_onboarding_complete ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {profile.stripe_onboarding_complete
                  ? 'Stripe Connected'
                  : 'Start Stripe Onboarding'}
              </button>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={prevStep}
                className="text-gray-600 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={nextStep}
                disabled={!profile.stripe_onboarding_complete}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {/* Step 5: Review & Complete */}
        {step === 5 && (
          <section className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold">Review & Complete</h2>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span className="font-medium">Full Name:</span>{' '}
                {profile.full_name || '—'}
              </div>
              <div>
                <span className="font-medium">Username:</span>{' '}
                {profile.username || '—'}
              </div>
              <div>
                <span className="font-medium">Bio:</span> {profile.bio || '—'}
              </div>
              <div>
                <span className="font-medium">Website:</span>{' '}
                {profile.website_url || '—'}
              </div>
              <div>
                <span className="font-medium">Stripe:</span>{' '}
                {profile.stripe_onboarding_complete
                  ? 'Connected'
                  : 'Not connected'}
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={prevStep}
                className="text-gray-600 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Finish & Go to Dashboard
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
        Need help? Visit{' '}
        <Link href="/help" className="text-blue-600">
          Help Center
        </Link>
      </footer>
    </div>
  )
}
