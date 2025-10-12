'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/components/providers/session-provider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload } from 'lucide-react'

export default function ProfileCreatePage() {
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    avatar_url: '',
    bio: '',
    website_url: '',
  })

  useEffect(() => {
    if (!user) {
      if (typeof window !== 'undefined') {
        router.replace('/auth/signin?callbackUrl=%2Fprofile%2Fcreate')
      }
      return
    }
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/user/setup-profile', { method: 'GET' })
        const data = await res.json()
        if (res.ok && data?.profile) {
          setProfile(prev => ({ ...prev, ...data.profile }))
        }
      } catch {
        // ignore load errors
      }
    }
    loadProfile()
  }, [user, router])

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
    } catch {
      alert('Failed to upload avatar')
    } finally {
      setAvatarUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      router.replace('/dashboard')
    } catch {
      setError('Unexpected error saving profile')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mi-card">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Create your profile</h1>
            <Link href="/" className="text-gray-600 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Avatar
              </label>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                  {}
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="h-12 w-12 object-cover"
                    />
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={triggerAvatarSelect}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  disabled={avatarUploading}
                >
                  <Upload className="h-4 w-4" />
                  {avatarUploading ? 'Uploading…' : 'Upload'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarSelected}
                />
              </div>
            </div>

            {/* Name and username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={e =>
                    setProfile(p => ({ ...p, full_name: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Your name"
                  required
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
                  required
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                rows={4}
                value={profile.bio}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Tell creators what you’re looking for."
                required
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Website (optional)
              </label>
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

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Submit and go to dashboard'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
