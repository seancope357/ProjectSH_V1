import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a seller
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const sequenceId = formData.get('sequenceId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!sequenceId) {
      return NextResponse.json({ error: 'Sequence ID required' }, { status: 400 })
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images allowed.' }, { status: 400 })
    }

    // Verify sequence ownership
    const sequence = await prisma.sequence.findFirst({
      where: {
        id: sequenceId,
        storefront: {
          sellerProfileId: sellerProfile.id,
        },
      },
    })

    if (!sequence) {
      return NextResponse.json({ error: 'Sequence not found or access denied' }, { status: 404 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${sequenceId}-preview-${timestamp}.${fileExtension}`
    const filePath = `previews/${sellerProfile.id}/${fileName}`

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Delete old preview if exists
    if (sequence.previewUrl) {
      const oldPath = sequence.previewUrl.split('/').slice(-3).join('/')
      await supabaseAdmin.storage
        .from('sequence-previews')
        .remove([oldPath])
    }

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('sequence-previews')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('sequence-previews')
      .getPublicUrl(data.path)

    // Update sequence with preview URL
    await prisma.sequence.update({
      where: { id: sequenceId },
      data: { 
        previewUrl: publicUrlData.publicUrl,
      },
    })

    return NextResponse.json({
      success: true,
      previewUrl: publicUrlData.publicUrl,
      fileName,
      fileSize: file.size,
    })
  } catch (error) {
    console.error('Preview upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}