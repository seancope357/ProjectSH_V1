import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Determine user role - map frontend role to database enum
    let userRole: 'USER' | 'SELLER' | 'ADMIN' = 'USER'
    if (role === 'seller') {
      userRole = 'SELLER'
    } else if (role === 'buyer') {
      userRole = 'USER'
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: userRole,
        // Note: We don't store password for OAuth-only users
        // This is for credential-based registration
      }
    })

    // If user is registering as a seller, create seller profile
    if (userRole === 'SELLER') {
      await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          displayName: name,
          isActive: true,
        }
      })
    }

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}