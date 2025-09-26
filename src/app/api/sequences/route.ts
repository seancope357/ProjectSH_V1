import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Return mock data for now to bypass database connection issues
    const mockSequences = [
      {
        id: '1',
        title: 'Sample LED Sequence',
        description: 'A beautiful LED light sequence for your project',
        price: 9.99,
        category: 'Entertainment',
        tags: ['led', 'lights', 'animation'],
        rating: 4.5,
        downloads: 150,
        createdAt: new Date().toISOString(),
        previewUrl: '/images/sequence-preview-default.jpg',
        seller: {
          name: 'Demo Seller',
        },
        reviewCount: 12,
      },
      {
        id: '2',
        title: 'Holiday Light Show',
        description: 'Perfect for holiday decorations and celebrations',
        price: 14.99,
        category: 'Holiday',
        tags: ['holiday', 'christmas', 'celebration'],
        rating: 4.8,
        downloads: 89,
        createdAt: new Date().toISOString(),
        previewUrl: '/images/sequence-preview-default.jpg',
        seller: {
          name: 'Holiday Lights Pro',
        },
        reviewCount: 8,
      },
    ]

    return NextResponse.json({
      sequences: mockSequences,
      pagination: {
        page: 1,
        limit: 12,
        total: 2,
        pages: 1,
      },
      total: 2,
    })
  } catch (error) {
    console.error('Get sequences error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve sequences' },
      { status: 500 }
    )
  }
}