import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase-db'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = await db.cart.findByUserId(user.id)
    return NextResponse.json({ items })
  } catch (e: any) {
    console.error('Cart GET failed:', e)
    return NextResponse.json(
      { error: e?.message || 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const sequenceId = body?.sequenceId
    if (!sequenceId) {
      return NextResponse.json(
        { error: 'sequenceId required' },
        { status: 400 }
      )
    }

    try {
      const item = await db.cart.addItem({
        user_id: user.id,
        sequence_id: sequenceId,
        quantity: 1,
      })
      return NextResponse.json({ item }, { status: 201 })
    } catch (insertError: any) {
      // Handle uniqueness conflicts gracefully
      const message = insertError?.message || ''
      if (
        message.toLowerCase().includes('duplicate') ||
        message.toLowerCase().includes('unique')
      ) {
        return NextResponse.json({ ok: true })
      }
      throw insertError
    }
  } catch (e: any) {
    console.error('Cart POST failed:', e)
    return NextResponse.json(
      { error: e?.message || 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.cart.clearCart(user.id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Cart DELETE failed:', e)
    return NextResponse.json(
      { error: e?.message || 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
