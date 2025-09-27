import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role } = body

    // Validate role
    if (!['USER', 'SELLER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be USER or SELLER' },
        { status: 400 }
      )
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { sellerProfile: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { role: role as 'USER' | 'SELLER' }
    })

    // If upgrading to SELLER and no seller profile exists, create one
    if (role === 'SELLER' && !currentUser.sellerProfile) {
      await prisma.sellerProfile.create({
        data: {
          userId: session.user.id,
          displayName: currentUser.name || 'Seller',
          isActive: true,
        }
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    })

  } catch (error) {
    console.error('Role update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}