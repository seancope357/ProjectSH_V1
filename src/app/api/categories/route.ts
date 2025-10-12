import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase-db'

export async function GET() {
  try {
    const categories = await db.categories.findMany()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Failed to load categories:', error)
    return NextResponse.json(
      { error: 'Failed to load categories' },
      { status: 500 }
    )
  }
}
