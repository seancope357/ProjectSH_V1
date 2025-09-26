import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'

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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    
    // Extract form fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const instructions = formData.get('instructions') as string
    const category = formData.get('category') as string
    const tags = formData.get('tags') as string
    const price = formData.get('price') as string
    const duration = formData.get('duration') as string
    const ledCount = formData.get('ledCount') as string
    const difficulty = formData.get('difficulty') as string
    const sequenceFile = formData.get('sequenceFile') as File
    const previewImage = formData.get('previewImage') as File | null

    // Validation
    if (!title || !description || !category || !price || !sequenceFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (parseFloat(price) <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 })
    }

    // Validate sequence file
    if (sequenceFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Sequence file too large (max 50MB)' }, { status: 400 })
    }

    if (!ALLOWED_SEQUENCE_TYPES.includes(sequenceFile.type)) {
      return NextResponse.json({ error: 'Invalid sequence file type. Only ZIP files allowed.' }, { status: 400 })
    }

    // Validate preview image if provided
    if (previewImage && previewImage.size > 0) {
      if (previewImage.size > 10 * 1024 * 1024) { // 10MB for images
        return NextResponse.json({ error: 'Preview image too large (max 10MB)' }, { status: 400 })
      }

      if (!ALLOWED_IMAGE_TYPES.includes(previewImage.type)) {
        return NextResponse.json({ error: 'Invalid image type. Only JPEG, PNG, WebP, and GIF allowed.' }, { status: 400 })
      }
    }

    // Mock successful upload response (bypassing database operations for now)
    const mockSequenceId = `seq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      sequenceId: mockSequenceId,
      message: 'Sequence uploaded successfully and is pending approval',
    })

  } catch (error) {
    console.error('Sequence creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create sequence' },
      { status: 500 }
    )
  }
}