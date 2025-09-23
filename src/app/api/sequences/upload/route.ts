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

    // Check if user is a seller
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile required' }, { status: 403 })
    }

    // Get seller's storefront
    const storefront = await prisma.storefront.findUnique({
      where: { sellerProfileId: sellerProfile.id },
    })

    if (!storefront) {
      return NextResponse.json({ error: 'Storefront required' }, { status: 403 })
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

    // Create sequence in database first
    const sequence = await prisma.sequence.create({
      data: {
        title,
        description,
        instructions: instructions || null,
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        price: Math.round(parseFloat(price) * 100), // Convert to cents
        duration: duration || null,
        ledCount: ledCount ? parseInt(ledCount) : null,
        difficulty: difficulty as any,
        storefrontId: storefront.id,
        isActive: false, // Set to false until files are uploaded
        isApproved: false, // Requires admin approval
      },
    })

    try {
      // Upload sequence file
      const timestamp = Date.now()
      const sequenceFileName = `${sequence.id}-${timestamp}.zip`
      const sequenceFilePath = `sequences/${sellerProfile.id}/${sequenceFileName}`

      const sequenceBuffer = Buffer.from(await sequenceFile.arrayBuffer())

      const { data: sequenceUploadData, error: sequenceUploadError } = await supabaseAdmin.storage
        .from('sequence-files')
        .upload(sequenceFilePath, sequenceBuffer, {
          contentType: sequenceFile.type,
          upsert: false,
        })

      if (sequenceUploadError) {
        throw new Error(`Sequence upload failed: ${sequenceUploadError.message}`)
      }

      // Create sequence version
      await prisma.sequenceVersion.create({
        data: {
          sequenceId: sequence.id,
          version: '1.0.0',
          fileUrl: sequenceUploadData.path,
          fileSize: sequenceFile.size,
          checksum: '', // You might want to calculate an actual checksum
        },
      })

      // Upload preview image if provided
      let previewUrl = null
      if (previewImage && previewImage.size > 0) {
        const imageExtension = previewImage.name.split('.').pop()
        const imageFileName = `${sequence.id}-preview-${timestamp}.${imageExtension}`
        const imageFilePath = `previews/${sellerProfile.id}/${imageFileName}`

        const imageBuffer = Buffer.from(await previewImage.arrayBuffer())

        const { data: imageUploadData, error: imageUploadError } = await supabaseAdmin.storage
          .from('sequence-previews')
          .upload(imageFilePath, imageBuffer, {
            contentType: previewImage.type,
            upsert: false,
          })

        if (imageUploadError) {
          console.warn('Preview image upload failed:', imageUploadError.message)
        } else {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from('sequence-previews')
            .getPublicUrl(imageUploadData.path)
          
          previewUrl = publicUrlData.publicUrl
        }
      }

      // Update sequence with preview URL and activate it
      await prisma.sequence.update({
        where: { id: sequence.id },
        data: {
          previewUrl,
          isActive: true, // Now that files are uploaded, activate the sequence
        },
      })

      return NextResponse.json({
        success: true,
        sequenceId: sequence.id,
        message: 'Sequence uploaded successfully and is pending approval',
      })

    } catch (uploadError) {
      // If file upload fails, delete the sequence record
      await prisma.sequence.delete({
        where: { id: sequence.id },
      })
      
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload files' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Sequence creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create sequence' },
      { status: 500 }
    )
  }
}