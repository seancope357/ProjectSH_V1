import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SupabaseDB } from '@/lib/supabase-db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try Prisma first, fallback to Supabase
    try {
      const setupProfile = await prisma.userSetupProfile.findUnique({
        where: { userId: session.user.id }
      })

      return NextResponse.json({ setupProfile })
    } catch (prismaError) {
      console.error('Prisma error, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase - simplified profile data
      const user = await SupabaseDB.getUserById(session.user.id)
      
      return NextResponse.json({ 
        setupProfile: user ? {
          id: user.id,
          userId: user.id,
          // Default values for setup profile
          ledCount: null,
          controllerType: null,
          voltage: null,
          maxCurrent: null,
          protocol: null,
          refreshRate: null,
          difficulty: null,
          props: null,
          preferences: null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        } : null 
      })
    }
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

    // Try Prisma first, fallback to Supabase
    try {
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
    } catch (prismaError) {
      console.error('Prisma error, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase - upsert user with profile data
      const updatedUser = await SupabaseDB.upsertUser({
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || '',
        // Store setup profile data in user metadata for fallback
        metadata: {
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
        updatedAt: new Date().toISOString(),
      })

      if (!updatedUser) {
        return NextResponse.json(
          { error: 'Failed to update setup profile' },
          { status: 500 }
        )
      }

      // Return formatted setup profile
      return NextResponse.json({
        setupProfile: {
          id: updatedUser.id,
          userId: updatedUser.id,
          ledCount,
          controllerType,
          voltage,
          maxCurrent,
          protocol,
          refreshRate,
          difficulty,
          props,
          preferences,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        }
      })
    }
  } catch (error) {
    console.error('Failed to update setup profile:', error)
    return NextResponse.json(
      { error: 'Failed to update setup profile' },
      { status: 500 }
    )
  }
}