import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-db'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await request.formData()
    const file = form.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    const maxSizeMB = 5
    const sizeMB = file.size / (1024 * 1024)

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      )
    }
    if (sizeMB > maxSizeMB) {
      return NextResponse.json(
        { error: `File too large. Max ${maxSizeMB}MB` },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ext =
      file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
          ? 'webp'
          : 'jpg'
    const safeName = (file as any).name
      ? String((file as any).name).replace(/[^a-zA-Z0-9._-]/g, '')
      : `avatar.${ext}`
    const key = `${user.id}/${crypto.randomUUID()}-${safeName}`

    // Upload to avatars bucket
    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(key, buffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload avatar' },
        { status: 500 }
      )
    }

    const { data: pub } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(key)
    const avatarUrl = pub?.publicUrl || null

    // Update the user's profile avatar_url via RLS-safe client
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile avatar' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { avatarUrl, profile: updated, message: 'Avatar updated' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Avatar upload route error:', error)
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}
