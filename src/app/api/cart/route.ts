import { NextRequest, NextResponse } from 'next/server'
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

    const { data, error: qErr } = await supabase
      .from('cart_items')
      .select(
        `
        *,
        sequence:sequences(
          *,
          seller:profiles!sequences_seller_id_fkey(username)
        )
      `
      )
      .eq('user_id', user.id)

    if (qErr) throw qErr
    const items = data || []
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

    const { data: item, error: insErr } = await supabase
      .from('cart_items')
      .insert({ user_id: user.id, sequence_id: sequenceId, quantity: 1 })
      .select()
      .single()

    if (insErr) {
      const message = (insErr?.message || '').toLowerCase()
      const code = (insErr as any)?.code || ''
      if (
        message.includes('duplicate') ||
        message.includes('unique') ||
        code === '23505'
      ) {
        return NextResponse.json({ ok: true })
      }
      throw insErr
    }

    return NextResponse.json({ item }, { status: 201 })
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

    const { error: delErr } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
    if (delErr) throw delErr
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Cart DELETE failed:', e)
    return NextResponse.json(
      { error: e?.message || 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
