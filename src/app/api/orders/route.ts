import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { db } from '@/lib/supabase-db'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await db.orders.findMany(user.id)

    // Normalize order items shape: expose `items` consistently
    const normalized = (orders || []).map((order: any) => {
      const { order_items, ...rest } = order || {}
      const items = (order_items || []).map((item: any) => ({
        sequence_id: item.sequence_id,
        price: item.price,
        seller_id: item.seller_id,
        sequence: item.sequences,
      }))
      return { ...rest, items }
    })

    return NextResponse.json({ orders: normalized })
  } catch (error) {
    console.error('Order retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve orders' },
      { status: 500 }
    )
  }
}
