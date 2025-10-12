'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
// Removed page-level Navigation; global header renders in layout
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Upload,
  Download,
  Star,
  Eye,
  Settings,
  Home,
  ShoppingBag,
  Bell,
  Shield,
  Lock,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    username: 'johndoe',
    bio: 'Automation enthusiast and productivity expert. Love creating sequences that make life easier.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    joinDate: 'January 2023',
    avatarUrl: '',
  })

  const [editData, setEditData] = useState(profileData)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSave = () => {
    setProfileData(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(profileData)
    setIsEditing(false)
  }

  const triggerAvatarSelect = () => {
    fileInputRef.current?.click()
  }

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
        console.error('Avatar upload failed:', json?.error)
        alert(json?.error || 'Failed to upload avatar')
        return
      }
      const url = json?.avatarUrl || ''
      setProfileData(prev => ({ ...prev, avatarUrl: url }))
      setEditData(prev => ({ ...prev, avatarUrl: url }))
    } catch (err) {
      console.error('Avatar upload error:', err)
      alert('Failed to upload avatar')
    } finally {
      setAvatarUploading(false)
      // Clear input value to allow re-uploading same file
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const stats = {
    sequences: 24,
    downloads: 1250,
    rating: 4.8,
    views: 5420,
  }

  // Account settings state (stubbed client-side for now)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    profileVisibility: 'public' as 'public' | 'private',
    twoFactorAuth: false,
  })

  const handleSaveSettings = () => {
    // TODO: integrate with backend API when available
    alert('Settings saved')
  }

  const recentSequences = [
    {
      id: 1,
      title: 'Email Automation Workflow',
      category: 'Productivity',
      downloads: 156,
      rating: 4.9,
      date: '2024-01-15',
    },
    {
      id: 2,
      title: 'Gaming Macro Set',
      category: 'Gaming',
      downloads: 89,
      rating: 4.7,
      date: '2024-01-10',
    },
    {
      id: 3,
      title: 'Design Tool Shortcuts',
      category: 'Creative',
      downloads: 203,
      rating: 4.8,
      date: '2024-01-05',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global header handled by RootLayout */}

      {/* Navigation Section */}
      <section
        className="bg-white border-b border-gray-200"
        aria-label="Breadcrumb Navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link
              href="/"
              className="flex items-center text-gray-500 hover:text-blue-700 transition-colors"
            >
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Profile</span>
          </div>
        </div>
      </section>

      {/* Header Section */}
      <section className="bg-white shadow-sm" aria-label="Profile Header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="mt-2 text-gray-600">
                Manage your account and view your activity
              </p>
            </div>

            {/* Quick Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/sequences"
                className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Marketplace
              </Link>

              <Link
                href="/orders"
                className="flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                My Orders
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Sub-navigation */}
      <nav
        className="bg-white border-b border-gray-200 sticky top-0 z-30"
        aria-label="Profile Section Navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 overflow-x-auto py-3 text-sm">
            <a
              href="#overview"
              className="text-gray-700 hover:text-blue-700 font-medium"
            >
              Overview
            </a>
            <a
              href="#settings"
              className="text-gray-700 hover:text-blue-700 font-medium"
            >
              Account Settings
            </a>
            <a
              href="#activity"
              className="text-gray-700 hover:text-blue-700 font-medium"
            >
              Activity
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content Section */}
      <section className="bg-gray-50 py-8" aria-label="Profile Content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Quick Navigation */}
          <div className="md:hidden mb-8">
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/sequences"
                className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Marketplace
              </Link>

              <Link
                href="/orders"
                className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                My Orders
              </Link>
              <Link
                href="/seller/dashboard"
                className="flex items-center justify-center px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Sell
              </Link>
            </div>
          </div>

          <div id="overview" className="grid lg:grid-cols-3 gap-8">
            {/* Profile Information Section */}
            <aside className="lg:col-span-1" aria-label="Profile Information">
              <section
                className="bg-white rounded-lg shadow-md p-6 mb-6"
                aria-label="User Profile"
              >
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    {profileData.avatarUrl ? (
                      <Image
                        src={profileData.avatarUrl}
                        alt="Profile avatar"
                        width={96}
                        height={96}
                        className="rounded-full mx-auto mb-4 object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                        {profileData.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </div>
                    )}
                    <button
                      onClick={triggerAvatarSelect}
                      disabled={avatarUploading}
                      className="absolute bottom-0 right-0 bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                      aria-label="Upload avatar"
                    >
                      <Upload className="h-4 w-4 text-gray-600" />
                    </button>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      ref={fileInputRef}
                      onChange={handleAvatarSelected}
                      className="hidden"
                    />
                  </div>

                  {!isEditing ? (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {profileData.name}
                      </h2>
                      <p className="text-gray-600">@{profileData.username}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editData.name}
                        onChange={e =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold"
                      />
                      <input
                        type="text"
                        value={editData.username}
                        onChange={e =>
                          setEditData({ ...editData, username: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-gray-600"
                        placeholder="Username"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    {!isEditing ? (
                      <span className="text-gray-600">{profileData.email}</span>
                    ) : (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={e =>
                          setEditData({ ...editData, email: e.target.value })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    {!isEditing ? (
                      <span className="text-gray-600">
                        {profileData.location}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={editData.location}
                        onChange={e =>
                          setEditData({ ...editData, location: e.target.value })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Location"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">
                      Joined {profileData.joinDate}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  {!isEditing ? (
                    <p className="text-gray-600">{profileData.bio}</p>
                  ) : (
                    <textarea
                      value={editData.bio}
                      onChange={e =>
                        setEditData({ ...editData, bio: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Tell us about yourself..."
                    />
                  )}
                </div>

                <div className="mt-6 flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </section>

              {/* Settings Section */}
              <section
                id="settings"
                className="bg-white rounded-lg shadow-md p-6"
                aria-label="User Settings"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Settings
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-gray-500" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Email Notifications
                        </h4>
                        <p className="text-sm text-gray-600">
                          Receive updates about your activity
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setSettings(s => ({
                          ...s,
                          emailNotifications: !s.emailNotifications,
                        }))
                      }
                      className={`px-3 py-1 rounded-full text-sm font-medium ${settings.emailNotifications ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {settings.emailNotifications ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-gray-500" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Profile Visibility
                        </h4>
                        <p className="text-sm text-gray-600">
                          Control who can view your profile
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setSettings(s => ({
                            ...s,
                            profileVisibility: 'public',
                          }))
                        }
                        className={`px-3 py-1 rounded-full text-sm font-medium ${settings.profileVisibility === 'public' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                      >
                        Public
                      </button>
                      <button
                        onClick={() =>
                          setSettings(s => ({
                            ...s,
                            profileVisibility: 'private',
                          }))
                        }
                        className={`px-3 py-1 rounded-full text-sm font-medium ${settings.profileVisibility === 'private' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                      >
                        Private
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-gray-500" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-gray-600">
                          Add extra security to your account
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setSettings(s => ({
                          ...s,
                          twoFactorAuth: !s.twoFactorAuth,
                        }))
                      }
                      className={`px-3 py-1 rounded-full text-sm font-medium ${settings.twoFactorAuth ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {settings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Theme
                      </h4>
                      <p className="text-sm text-gray-600">
                        Choose your preferred theme
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleSaveSettings}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              </section>
            </aside>

            {/* Main Dashboard Section */}
            <main
              className="lg:col-span-2 space-y-8"
              aria-label="Profile Dashboard"
            >
              {/* Stats Section */}
              <section
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                aria-label="Profile Statistics"
              >
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.sequences}
                  </div>
                  <div className="text-sm text-gray-600">Sequences</div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <Download className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.downloads}
                  </div>
                  <div className="text-sm text-gray-600">Downloads</div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.rating}
                  </div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <Eye className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.views}
                  </div>
                  <div className="text-sm text-gray-600">Views</div>
                </div>
              </section>

              {/* Recent Sequences Section */}
              <section
                id="activity"
                className="bg-white rounded-lg shadow-md"
                aria-label="Recent Sequences"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Activity History
                    </h2>
                    <div className="hidden md:flex items-center gap-3">
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        Filter
                      </button>
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        Export
                      </button>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {recentSequences.map(sequence => (
                    <div
                      key={sequence.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {sequence.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {sequence.category}
                            </span>
                            <span>{sequence.downloads} downloads</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span>{sequence.rating}</span>
                            </div>
                            <span>{sequence.date}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className="text-blue-700 hover:text-blue-800 transition-colors">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button className="text-gray-500 hover:text-gray-600 transition-colors">
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-gray-200 text-center">
                  <button className="text-blue-700 hover:text-blue-800 transition-colors font-medium">
                    View All Activity
                  </button>
                </div>
              </section>

              {/* Quick Actions Section */}
              <section
                className="bg-white rounded-lg shadow-md p-6"
                aria-label="Quick Actions"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload New Sequence
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                    <User className="h-5 w-5" />
                    Account Settings
                  </button>
                </div>
              </section>
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}
