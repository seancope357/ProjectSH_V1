import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { SupabaseDB } from '@/lib/supabase-db'

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
    let sellerProfile
    try {
      sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: session.user.id },
      })
    } catch (prismaError) {
      console.error('Prisma error, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase - check if user exists and has seller profile data
      const user = await SupabaseDB.getUserById(session.user.id)
      if (!user || !user.metadata?.sellerProfile) {
        return NextResponse.json({ error: 'Seller profile required' }, { status: 403 })
      }
      
      // Create a mock seller profile for compatibility
      sellerProfile = {
        id: user.id,
        userId: user.id,
        ...user.metadata.sellerProfile
      }
    }

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
    let sequence
    try {
      sequence = await prisma.sequence.findFirst({
        where: {
          id: sequenceId,
          storefront: {
            sellerProfileId: sellerProfile.id,
          },
        },
      })
    } catch (prismaError) {
      console.error('Prisma error, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase
      sequence = await SupabaseDB.getSequenceById(sequenceId)
      
      // Check ownership through sequence data
      if (sequence && sequence.storefront?.sellerProfile?.userId !== session.user.id) {
        sequence = null // Not owned by user
      }
    }

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

    // Create a new sequence version instead of updating sequence with filePath
    let sequenceVersion
    try {
      sequenceVersion = await prisma.sequenceVersion.create({
        data: {
          sequenceId: sequenceId,
          version: '1.0.0', // You might want to increment this based on existing versions
          fileUrl: data.path,
          fileSize: file.size,
          checksum: '', // You might want to calculate an actual checksum
        },
      })
    } catch (prismaError) {
      console.error('Prisma error creating sequence version, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase - store version info in sequence metadata
      const updatedSequence = await SupabaseDB.updateSequence(sequenceId, {
        fileUrl: data.path,
        fileSize: file.size,
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
      })
      
      if (!updatedSequence) {
        return NextResponse.json({ error: 'Failed to save sequence version' }, { status: 500 })
      }
      
      // Create a mock sequence version for response
      sequenceVersion = {
        id: `${sequenceId}-v1`,
        sequenceId: sequenceId,
        version: '1.0.0',
        fileUrl: data.path,
        fileSize: file.size,
        checksum: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    return NextResponse.json({
      success: true,
      fileUrl: data.path,
      fileName,
      fileSize: file.size,
      version: sequenceVersion.version,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}