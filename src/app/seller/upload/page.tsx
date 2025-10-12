'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
// Removed page-level Navigation; global header renders in layout
import { useAuth } from '@/components/providers/session-provider'
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react'

type Status = 'idle' | 'validating' | 'uploading' | 'success' | 'error'

export default function SellerUploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [bundleFile, setBundleFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('9.99')
  const [tagsInput, setTagsInput] = useState('')
  const [tagsList, setTagsList] = useState<string[]>([])
  const [hotTags, setHotTags] = useState<string[]>([])
  const [tagError, setTagError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const bundleInputRef = useRef<HTMLInputElement | null>(null)

  // Audio license capture
  const [audioLicenseType, setAudioLicenseType] = useState<
    'none' | 'licensed' | 'public-domain' | 'creator-owned' | 'other'
  >('none')
  const [audioLicenseUrl, setAudioLicenseUrl] = useState('')
  const [audioTitle, setAudioTitle] = useState('')
  const [audioArtist, setAudioArtist] = useState('')
  const [audioLicenseNotes, setAudioLicenseNotes] = useState('')

  useEffect(() => {
    if (!user) return // Fetch hot tag suggestions from market insights
    ;(async () => {
      try {
        const res = await fetch('/api/market/trending')
        if (!res.ok) return
        const data = await res.json()
        const names: string[] = Array.isArray(data?.hotTags)
          ? data.hotTags.map((t: any) => t.name)
          : []
        setHotTags(names)
      } catch {}
    })()
  }, [user])

  const onSelectFile = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const f = files[0]
    setError(null)
    setFile(f)
  }, [])

  const onSelectBundle = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const f = files[0]
    setError(null)
    setBundleFile(f)
  }, [])

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    onSelectFile(e.dataTransfer.files)
  }

  const validate = (): string | null => {
    if (!file) return 'Please select a file to upload.'
    if (!title.trim() || !description.trim())
      return 'Title and description are required.'
    const allowed = [
      'video/mp4',
      'application/zip',
      'application/octet-stream',
      'application/x-zip-compressed',
    ]
    if (!allowed.includes(file.type))
      return `Unsupported file type: ${file.type}`
    const maxMB = 200
    if (file.size / (1024 * 1024) > maxMB)
      return `File too large. Max ${maxMB}MB.`
    const p = parseFloat(price)
    if (Number.isNaN(p) || p < 0) return 'Price must be a non-negative number.'
    if (bundleFile) {
      const bundleAllowed = ['application/zip', 'application/x-zip-compressed']
      if (!bundleAllowed.includes(bundleFile.type))
        return `Bundle must be a ZIP file.`
      if (bundleFile.size / (1024 * 1024) > maxMB)
        return `Bundle too large. Max ${maxMB}MB.`
    }
    // Audio license validation
    if (audioLicenseType === 'licensed' && !audioLicenseUrl.trim()) {
      return 'Please provide the audio license URL for licensed tracks.'
    }
    // Validate existing tags before submit
    for (const t of tagsList) {
      const err = validateTagCandidate(t)
      if (err) return `Invalid tag "${t}": ${err}`
    }
    return null
  }

  // Tag helpers
  const normalizeTag = (t: string) =>
    t.trim().toLowerCase().replace(/\s+/g, '-')
  const TAG_MIN = 2
  const TAG_MAX = 24
  const validateTagCandidate = (cand: string): string | null => {
    if (!cand) return 'Tag is empty.'
    if (cand.length < TAG_MIN || cand.length > TAG_MAX)
      return `Tag must be ${TAG_MIN}-${TAG_MAX} characters.`
    if (!/^[a-z0-9-]+$/.test(cand))
      return 'Only letters, numbers, and hyphens are allowed.'
    if (cand.startsWith('-') || cand.endsWith('-'))
      return 'No leading or trailing hyphens.'
    if (cand.includes('--')) return 'Avoid consecutive hyphens.'
    return null
  }
  const addTagsFromInput = (input: string) => {
    const raw = input.split(',').map(normalizeTag).filter(Boolean)
    if (!raw.length) return
    const errors: string[] = []
    const valids: string[] = []
    raw.forEach(cand => {
      const err = validateTagCandidate(cand)
      if (err) errors.push(`"${cand}": ${err}`)
      else valids.push(cand)
    })
    if (valids.length) {
      setTagsList(prev => {
        const set = new Set(prev)
        valids.forEach(t => set.add(t))
        return Array.from(set).slice(0, 12)
      })
    }
    if (errors.length) {
      setTagError(
        `Invalid ${errors.length > 1 ? 'tags' : 'tag'}: ${errors.join(', ')}`
      )
    } else {
      setTagError(null)
      setTagsInput('')
    }
  }
  const removeTag = (t: string) =>
    setTagsList(prev => prev.filter(x => x !== t))
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault()
      addTagsFromInput(tagsInput)
    }
  }
  useEffect(() => {
    // Clear inline error while user edits
    if (tagError) setTagError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsInput])
  const suggested = hotTags
    .filter(t => t.toLowerCase().includes(tagsInput.trim().toLowerCase()))
    .filter(t => !tagsList.includes(normalizeTag(t)))
    .slice(0, 8)

  const doUpload = async () => {
    setStatus('validating')
    const err = validate()
    if (err) {
      setError(err)
      setStatus('error')
      return
    }

    setStatus('uploading')
    setProgress(0)

    const form = new FormData()
    if (file) form.append('file', file)
    if (bundleFile) form.append('bundle', bundleFile)
    form.append('title', title)
    form.append('description', description)
    form.append('price', price)
    form.append('tags', tagsList.join(','))

    // audio license fields
    form.append('audio_license_type', audioLicenseType)
    form.append('audio_license_url', audioLicenseUrl)
    form.append('audio_title', audioTitle)
    form.append('audio_artist', audioArtist)
    form.append('audio_license_notes', audioLicenseNotes)

    // Use XMLHttpRequest for progress feedback
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/upload/sequence', true)
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100)
        setProgress(pct)
      }
    }
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        try {
          const resp = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) {
            setStatus('success')
            setProgress(100)
            // Redirect to sequence page
            if (resp?.id) router.push(`/sequence/${resp.id}`)
          } else {
            setError(resp?.error || 'Upload failed')
            setStatus('error')
          }
        } catch {
          setError('Unexpected response from server')
          setStatus('error')
        }
      }
    }
    xhr.onerror = () => {
      setError('Network error during upload')
      setStatus('error')
    }
    xhr.send(form)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global header handled by RootLayout */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Upload New Sequence
        </h1>
        <p className="text-gray-600 mb-6">
          Select your sequence file, optionally add a ZIP bundle, capture audio
          licensing, and publish when ready.
        </p>

        {/* File selection */}
        <div
          className="border-2 border-dashed rounded-lg p-6 bg-white hover:bg-gray-50 transition"
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Upload className="h-6 w-6 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">
                  Drag & drop your sequence file here
                </div>
                <div className="text-sm text-gray-600">
                  FSEQ, MP4 or ZIP up to 200MB
                </div>
              </div>
            </div>
            <button
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => inputRef.current?.click()}
            >
              Choose File
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".fseq,.mp4,.zip"
            className="hidden"
            onChange={e => onSelectFile(e.target.files)}
          />

          {file && (
            <div className="mt-4 text-sm text-gray-700">
              Selected sequence:{' '}
              <span className="font-medium">{file.name}</span> (
              {(file.size / (1024 * 1024)).toFixed(1)} MB)
            </div>
          )}
        </div>

        {/* Optional bundle ZIP */}
        <div className="mt-4 border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-gray-900">
                Optional ZIP bundle
              </div>
              <div className="text-sm text-gray-600">
                Include maps, presets, docs. ZIP up to 200MB.
              </div>
            </div>
            <button
              className="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              onClick={() => bundleInputRef.current?.click()}
            >
              {bundleFile ? 'Change ZIP' : 'Add ZIP'}
            </button>
          </div>
          <input
            ref={bundleInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={e => onSelectBundle(e.target.files)}
          />
          {bundleFile && (
            <div className="mt-2 text-sm text-gray-700">
              Selected bundle:{' '}
              <span className="font-medium">{bundleFile.name}</span> (
              {(bundleFile.size / (1024 * 1024)).toFixed(1)} MB)
            </div>
          )}
        </div>

        {/* Details form */}
        <div className="mt-6 bg-white rounded-lg p-6 border space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Price (USD)
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Tags</label>
              <div
                className={`border rounded px-3 py-2 ${tagError ? 'border-red-400' : ''}`}
              >
                <div className="flex flex-wrap gap-2 mb-2">
                  {tagsList.map(t => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        aria-label={`Remove ${t}`}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  className="w-full outline-none"
                  placeholder={`Type a tag (${TAG_MIN}-${TAG_MAX} chars, a-z 0-9 -) and press Enter`}
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => addTagsFromInput(tagsInput)}
                />
                {tagError && (
                  <div className="mt-2 text-xs text-red-600">{tagError}</div>
                )}
                {suggested.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {suggested.map(s => (
                      <button
                        key={s}
                        type="button"
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100"
                        onClick={() => addTagsFromInput(s)}
                      >
                        #{s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audio licensing */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Audio License</label>
              <select
                className="border rounded px-3 py-2 text-sm"
                value={audioLicenseType}
                onChange={e => setAudioLicenseType(e.target.value as any)}
              >
                <option value="none">No Audio</option>
                <option value="licensed">Licensed (provide URL)</option>
                <option value="public-domain">Public Domain</option>
                <option value="creator-owned">Creator-Owned</option>
                <option value="other">Other</option>
              </select>
            </div>
            {audioLicenseType !== 'none' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Audio Title
                  </label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={audioTitle}
                    onChange={e => setAudioTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Artist
                  </label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={audioArtist}
                    onChange={e => setAudioArtist(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">
                    License URL
                  </label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={audioLicenseUrl}
                    onChange={e => setAudioLicenseUrl(e.target.value)}
                    placeholder="Link to license or proof"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    value={audioLicenseNotes}
                    onChange={e => setAudioLicenseNotes(e.target.value)}
                    placeholder="Any relevant license details or restrictions"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feedback / actions */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm">
            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            {status === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                Upload complete! Redirecting…
              </div>
            )}
            {status === 'uploading' && (
              <div className="text-gray-700">
                <div className="mb-1">Uploading… {progress}%</div>
                <div className="w-64 h-2 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-2 bg-blue-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              onClick={() => router.push('/seller/dashboard')}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={doUpload}
              disabled={status === 'uploading'}
            >
              {status === 'uploading' ? 'Uploading…' : 'Upload Sequence'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
