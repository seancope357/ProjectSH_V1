import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_SEQUENCE_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream'
]

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const category = formData.get('category') as string
    const tags = JSON.parse(formData.get('tags') as string || '[]')

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { error: 'Only ZIP files are allowed' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's storefront
    const storefront = await prisma.storefront.findFirst({
      where: { 
        sellerProfile: {
          userId: session.user.id
        }
      },
    })

    if (!storefront) {
      return NextResponse.json(
        { error: 'Storefront not found' },
        { status: 404 }
      )
    }

    // Convert file to buffer for storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`

    // Create sequence record with initial version
    const sequence = await prisma.sequence.create({
      data: {
        title,
        description,
        price: Math.round(price * 100), // Convert to cents
        category,
        tags,
        slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        storefrontId: storefront.id,
        isActive: false, // Requires approval
        isApproved: false,
        versions: {
          create: {
            version: '1.0.0',
            fileUrl: `/uploads/sequences/${uniqueFilename}`,
            fileSize: buffer.length,
            checksum: `sha256-${Date.now()}`, // In production, calculate actual checksum
          }
        }
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Sequence uploaded successfully',
      sequenceId: sequence.id,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload sequence' },
      { status: 500 }
    )
  }
}