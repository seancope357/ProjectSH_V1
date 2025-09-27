import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const setupProfile = await prisma.userSetupProfile.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ setupProfile })
  } catch (error) {
    console.error('Failed to fetch setup profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch setup profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      ledCount,
      controllerType,
      voltage,
      maxCurrent,
      protocol,
      refreshRate,
      difficulty,
      props,
      preferences
    } = body

    const setupProfile = await prisma.userSetupProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ledCount,
        controllerType,
        voltage,
        maxCurrent,
        protocol,
        refreshRate,
        difficulty,
        props,
        preferences,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        ledCount,
        controllerType,
        voltage,
        maxCurrent,
        protocol,
        refreshRate,
        difficulty,
        props,
        preferences,
      },
    })

    return NextResponse.json({ setupProfile })
  } catch (error) {
    console.error('Failed to update setup profile:', error)
    return NextResponse.json(
      { error: 'Failed to update setup profile' },
      { status: 500 }
    )
  }
}