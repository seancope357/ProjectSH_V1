import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const { action } = await request.json()

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const sequence = await prisma.sequence.findUnique({
      where: { id },
    })

    if (!sequence) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
    }

    // Update sequence based on action
    const updatedSequence = await prisma.sequence.update({
      where: { id },
      data: {
        isApproved: action === 'approve',
        isActive: action === 'approve',
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      sequence: updatedSequence,
    })
  } catch (error) {
    console.error('Admin sequence action error:', error)
    return NextResponse.json(
      { error: 'Failed to process sequence action' },
      { status: 500 }
    )
  }
}