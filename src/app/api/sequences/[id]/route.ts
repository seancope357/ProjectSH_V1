import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SupabaseDB } from '@/lib/supabase-db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Try Prisma first, fallback to Supabase
    try {
      const sequence = await prisma.sequence.findUnique({
        where: { 
          id,
          isActive: true,
          isApproved: true,
        },
        include: {
          storefront: {
            include: {
              sellerProfile: {
                select: {
                  displayName: true,
                },
              },
            },
          },
          reviews: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      })

      if (!sequence) {
        return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
      }

      // Format the response
      const formattedSequence = {
        id: sequence.id,
        title: sequence.title,
        description: sequence.description,
        instructions: sequence.instructions,
        price: sequence.price,
        category: sequence.category,
        tags: sequence.tags,
        rating: sequence.rating || 0,
        downloads: sequence.downloadCount || 0,
        createdAt: sequence.createdAt.toISOString(),
        updatedAt: sequence.updatedAt.toISOString(),
        previewUrl: sequence.previewUrl,
        seller: {
          name: sequence.storefront?.sellerProfile?.displayName || 'Unknown Seller',
          storefront: sequence.storefront?.name || 'Unknown Store',
        },
        reviews: sequence.reviews.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt.toISOString(),
          user: {
            name: review.user.name,
            image: review.user.image,
          },
        })),
        reviewCount: sequence._count.reviews,
      }

      return NextResponse.json(formattedSequence)
    } catch (prismaError) {
      console.error('Prisma error, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase
      const sequence = await SupabaseDB.getSequenceById(id)
      
      if (!sequence) {
        return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
      }

      // Format the response (simplified for Supabase)
      const formattedSequence = {
        id: sequence.id,
        title: sequence.title,
        description: sequence.description,
        instructions: sequence.instructions,
        price: sequence.price,
        category: sequence.category,
        tags: sequence.tags,
        rating: sequence.rating || 0,
        downloads: sequence.downloadCount || 0,
        createdAt: sequence.createdAt,
        updatedAt: sequence.updatedAt,
        previewUrl: sequence.previewUrl,
        seller: {
          name: 'Seller', // Simplified for fallback
          storefront: 'Store',
        },
        reviews: [], // Not available in simple Supabase query
        reviewCount: 0,
      }

      return NextResponse.json(formattedSequence)
    }
  } catch (error) {
    console.error('Get sequence error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve sequence' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Try Prisma first, fallback to Supabase
     try {
       // First check ownership
       const existingSequence = await prisma.sequence.findUnique({
         where: { id },
         include: {
           storefront: {
             include: {
               sellerProfile: true,
             },
           },
         },
       })

       if (!existingSequence) {
         return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
       }

       const isOwner = existingSequence.storefront.sellerProfile?.userId === session.user.id
       const isAdmin = session.user.role === 'ADMIN'

       if (!isOwner && !isAdmin) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
       }

       const sequence = await prisma.sequence.update({
         where: { id },
        data: {
          title: body.title,
          description: body.description,
          instructions: body.instructions,
          price: body.price,
          category: body.category,
          tags: body.tags,
          updatedAt: new Date(),
        },
      })

      return NextResponse.json(sequence)
    } catch (prismaError) {
      console.error('Prisma error, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase
      const updatedSequence = await SupabaseDB.updateSequence(id, {
        title: body.title,
        description: body.description,
        instructions: body.instructions,
        price: body.price,
        category: body.category,
        tags: body.tags,
        updatedAt: new Date().toISOString(),
      })

      if (!updatedSequence) {
        return NextResponse.json({ error: 'Sequence not found or unauthorized' }, { status: 404 })
      }

      return NextResponse.json(updatedSequence)
    }
  } catch (error) {
    console.error('Update sequence error:', error)
    return NextResponse.json(
      { error: 'Failed to update sequence' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Try Prisma first, fallback to Supabase
     try {
       // First check ownership
       const existingSequence = await prisma.sequence.findUnique({
         where: { id },
         include: {
           storefront: {
             include: {
               sellerProfile: true,
             },
           },
         },
       })

       if (!existingSequence) {
         return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
       }

       const isOwner = existingSequence.storefront.sellerProfile?.userId === session.user.id
       const isAdmin = session.user.role === 'ADMIN'

       if (!isOwner && !isAdmin) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
       }

       // Soft delete by setting isActive to false
       await prisma.sequence.update({
         where: { id },
         data: {
           isActive: false,
           updatedAt: new Date(),
         },
       })

      return NextResponse.json({ success: true })
    } catch (prismaError) {
      console.error('Prisma error, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase
      const deleted = await SupabaseDB.deleteSequence(id)
      
      if (!deleted) {
        return NextResponse.json({ error: 'Sequence not found or unauthorized' }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Delete sequence error:', error)
    return NextResponse.json(
      { error: 'Failed to delete sequence' },
      { status: 500 }
    )
  }
}