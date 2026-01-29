'use client'

import React, { useState, useRef } from 'react'
import Input from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Upload, User } from 'lucide-react'
import Button from '@/components/ui/Button'

interface ProfileStepProps {
  formData: {
    sellerName: string
    sellerBio: string
    sellerTagline: string
    profilePictureUrl: string
    websiteUrl: string
    facebookUrl: string
    instagramUrl: string
    youtubeUrl: string
  }
  onChange: (field: string, value: string) => void
  onUploadProfilePicture: (file: File) => Promise<void>
  isUploading: boolean
}

const ProfileStep: React.FC<ProfileStepProps> = ({
  formData,
  onChange,
  onUploadProfilePicture,
  isUploading,
}) => {
  const [uploadError, setUploadError] = useState<string>('')
  // Accessibility: Ref for managing focus after upload
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB')
      return
    }

    setUploadError('')
    try {
      await onUploadProfilePicture(file)
    } catch (error) {
      setUploadError('Failed to upload image. Please try again.')
    }
  }

  // Accessibility: Keyboard accessible file upload trigger
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Accessibility: Keyboard handler for file upload button
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleUploadClick()
    }
  }

  return (
    <div className="space-y-6">
      {/* Accessibility: ARIA live region for dynamic status updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isUploading && 'Uploading profile picture, please wait'}
        {uploadError && `Error: ${uploadError}`}
        {formData.profilePictureUrl && !isUploading && 'Profile picture uploaded successfully'}
      </div>

      {/* Profile Picture */}
      <div>
        <Label htmlFor="profile-picture-upload" className="text-white mb-3 block">
          Profile Picture
        </Label>
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {formData.profilePictureUrl ? (
              <img
                src={formData.profilePictureUrl}
                alt={`Profile picture of ${formData.sellerName || 'seller'}`}
                className="h-24 w-24 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <div
                className="h-24 w-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center"
                role="img"
                aria-label="No profile picture uploaded"
              >
                <User className="h-10 w-10 text-white/40" aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="flex-1">
            {/* Accessibility: Keyboard accessible upload button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleUploadClick}
              onKeyDown={handleKeyDown}
              disabled={isUploading}
              aria-label={isUploading ? 'Uploading profile picture' : 'Upload profile picture'}
              aria-describedby="profile-picture-help"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </Button>

            {/* Accessibility: Hidden but keyboard accessible file input */}
            <input
              ref={fileInputRef}
              id="profile-picture-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isUploading}
              aria-invalid={!!uploadError}
              aria-describedby={uploadError ? 'upload-error profile-picture-help' : 'profile-picture-help'}
            />

            <p id="profile-picture-help" className="mt-2 text-xs text-white/50">
              JPG, PNG or GIF. Max size 5MB. Square images work best.
            </p>

            {/* Accessibility: Error message with proper ARIA attributes */}
            {uploadError && (
              <p
                id="upload-error"
                className="mt-2 text-xs text-red-400"
                role="alert"
                aria-live="assertive"
              >
                {uploadError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Seller Name */}
      <div>
        <Label htmlFor="seller-name" className="text-white mb-2 block">
          Seller Name / Brand <span className="text-accent" aria-label="required">*</span>
        </Label>
        <Input
          id="seller-name"
          value={formData.sellerName}
          onChange={(e) => onChange('sellerName', e.target.value)}
          placeholder="Your name or business name"
          required
          maxLength={100}
          aria-required="true"
          aria-describedby="seller-name-help"
          aria-invalid={!formData.sellerName.trim()}
        />
        <p id="seller-name-help" className="mt-1.5 text-xs text-white/50">
          This is how buyers will know you. Choose a professional, memorable name.
        </p>
      </div>

      {/* Tagline */}
      <div>
        <Label htmlFor="seller-tagline" className="text-white mb-2 block">
          Tagline
        </Label>
        <Input
          id="seller-tagline"
          value={formData.sellerTagline}
          onChange={(e) => onChange('sellerTagline', e.target.value)}
          placeholder="e.g., Creating magical Christmas sequences since 2015"
          maxLength={150}
          aria-describedby="tagline-help"
        />
        <p id="tagline-help" className="mt-1.5 text-xs text-white/50">
          A brief, catchy phrase that describes what makes your sequences special.
        </p>
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="seller-bio" className="text-white mb-2 block">
          About You
        </Label>
        <textarea
          id="seller-bio"
          value={formData.sellerBio}
          onChange={(e) => onChange('sellerBio', e.target.value)}
          placeholder="Tell buyers about your experience, style, and what inspires your work..."
          className="flex min-h-[120px] w-full rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-base font-medium text-white placeholder:text-gray-400 transition-all duration-300 focus:border-primary/60 focus:bg-white/10 focus:ring-2 focus:ring-primary/20 focus:outline-none hover:border-white/25 shadow-inner shadow-black/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          maxLength={1000}
          aria-describedby="bio-help bio-character-count"
        />
        <div className="mt-1.5 flex justify-between text-xs text-white/50">
          <span id="bio-help">Share your story and what makes your sequences unique.</span>
          <span id="bio-character-count" aria-live="polite">
            {formData.sellerBio.length}/1000 characters
          </span>
        </div>
      </div>

      {/* Social Links */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-white font-semibold mb-4">
          Social Links <span className="text-white/50 font-normal">(Optional)</span>
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="website-url" className="text-white/80 mb-2 block text-sm">
              Website
            </Label>
            <Input
              id="website-url"
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => onChange('websiteUrl', e.target.value)}
              placeholder="https://yourwebsite.com"
              aria-describedby="website-help"
            />
            <span id="website-help" className="sr-only">
              Enter your website URL starting with https://
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="facebook-url"
                className="text-white/80 mb-2 block text-sm"
              >
                Facebook
              </Label>
              <Input
                id="facebook-url"
                type="url"
                value={formData.facebookUrl}
                onChange={(e) => onChange('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                aria-describedby="facebook-help"
              />
              <span id="facebook-help" className="sr-only">
                Enter your Facebook page URL
              </span>
            </div>

            <div>
              <Label
                htmlFor="instagram-url"
                className="text-white/80 mb-2 block text-sm"
              >
                Instagram
              </Label>
              <Input
                id="instagram-url"
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => onChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/youraccount"
                aria-describedby="instagram-help"
              />
              <span id="instagram-help" className="sr-only">
                Enter your Instagram profile URL
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="youtube-url" className="text-white/80 mb-2 block text-sm">
              YouTube
            </Label>
            <Input
              id="youtube-url"
              type="url"
              value={formData.youtubeUrl}
              onChange={(e) => onChange('youtubeUrl', e.target.value)}
              placeholder="https://youtube.com/yourchannel"
              aria-describedby="youtube-help"
            />
            <span id="youtube-help" className="sr-only">
              Enter your YouTube channel URL
            </span>
          </div>
        </div>
      </div>

      {/* Accessibility: Informational section with proper semantic structure */}
      <div
        className="p-4 rounded-lg bg-primary/5 border border-primary/20"
        role="region"
        aria-label="Buyer perspective information"
      >
        <p className="text-sm text-white/70">
          <strong className="text-white">Buyer Perspective:</strong> A complete profile
          with a photo and bio builds trust and helps buyers feel confident purchasing
          from you. Sellers with complete profiles see 3x more sales on average.
        </p>
      </div>
    </div>
  )
}

export default ProfileStep
