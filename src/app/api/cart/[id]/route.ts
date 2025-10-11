import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase-db'
import { createClient } from '@/lib/supabase-server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const quantity = Number(body?.quantity)
    if (!Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: 'Valid quantity required' },
        { status: 400 }
      )
    }

    // Update quantity — relies on row existing and RLS/service role safety handled in db layer
    const item = await db.cart.updateQuantity(params.id, quantity)
    return NextResponse.json({ item })
  } catch (e: any) {
    console.error('Cart item PATCH failed:', e)
    return NextResponse.json(
      { error: e?.message || 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.cart.removeItem(params.id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Cart item DELETE failed:', e)
    return NextResponse.json(
      { error: e?.message || 'Failed to remove cart item' },
      { status: 500 }
    )
  }
}
