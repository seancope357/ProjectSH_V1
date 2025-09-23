import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
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
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only ZIP files allowed.' }, { status: 400 })
    }

    // Verify sequence ownership
    const sequence = await prisma.sequence.findFirst({
      where: {
        id: sequenceId,
        storefront: {
          sellerId: sellerProfile.id,
        },
      },
    })

    if (!sequence) {
      return NextResponse.json({ error: 'Sequence not found or access denied' }, { status: 404 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${sequenceId}-${timestamp}.zip`
    const filePath = `sequences/${sellerProfile.id}/${fileName}`

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('sequence-files')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Update sequence with file path
    await prisma.sequence.update({
      where: { id: sequenceId },
      data: { 
        filePath: data.path,
        fileSize: file.size,
      },
    })

    return NextResponse.json({
      success: true,
      filePath: data.path,
      fileName,
      fileSize: file.size,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}