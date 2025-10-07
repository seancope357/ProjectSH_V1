import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin, db } from '@/lib/supabase-db'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await request.formData()

    const file = form.get('file') as File | null
    const title = (form.get('title') as string) || ''
    const description = (form.get('description') as string) || ''
    const price = parseFloat((form.get('price') as string) || '0')
    const categoryId = (form.get('categoryId') as string) || null
    const tags = ((form.get('tags') as string) || '').split(',').map(t => t.trim()).filter(Boolean)

    // Basic validation
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }
    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'Price must be a non-negative number' }, { status: 400 })
    }

    const allowedTypes = ['video/mp4', 'application/zip', 'application/octet-stream']
    const maxSizeMB = 200
    const sizeMB = file.size / (1024 * 1024)
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 })
    }
    if (sizeMB > maxSizeMB) {
      return NextResponse.json({ error: `File too large. Max ${maxSizeMB}MB` }, { status: 400 })
    }

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ext = (file.type === 'video/mp4') ? 'mp4' : 'zip'
    const safeName = (file as any).name ? String((file as any).name).replace(/[^a-zA-Z0-9._-]/g, '') : `sequence.${ext}`
    const key = `${user.id}/${crypto.randomUUID()}-${safeName}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('sequences')
      .upload(key, buffer, { contentType: file.type, upsert: false })
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    const { data: pub } = supabaseAdmin.storage.from('sequences').getPublicUrl(key)
    const fileUrl = pub?.publicUrl || null

    // Create DB record
    const sequencePayload: any = {
      title,
      description,
      price,
      seller_id: user.id,
      category_id: categoryId || null,
      file_url: fileUrl,
      file_size: file.size,
      tags,
      status: 'draft',
      is_active: true,
      is_approved: false,
    }

    let created
    try {
      created = await db.sequences.create(sequencePayload)
    } catch (e) {
      console.error('Sequence create error:', e)
      // Attempt cleanup of uploaded file if DB insert fails
      try { await supabaseAdmin.storage.from('sequences').remove([key]) } catch {}
      return NextResponse.json({ error: 'Failed to create sequence record' }, { status: 500 })
    }

    return NextResponse.json({
      id: created.id,
      fileUrl,
      title: created.title,
      message: 'Upload successful',
    }, { status: 200 })
  } catch (error) {
    console.error('Sequence upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload sequence' },
      { status: 500 }
    )
  }
}