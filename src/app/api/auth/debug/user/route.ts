import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-db'

export async function GET(request: NextRequest) {
  try {
    // Restrict debug route in production unless explicitly enabled
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.ENABLE_DEBUG_ROUTES !== 'true'
    ) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.auth.admin.getUserById(id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const user = data?.user
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const identities = (user as any)?.identities || []
    const providers = identities.map((i: any) => i?.provider)

    return NextResponse.json({
      id: user.id,
      email: user.email,
      email_confirmed_at: (user as any)?.email_confirmed_at || null,
      created_at: user.created_at,
      phone: user.phone,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata,
      providers,
      identities,
    })
  } catch (e: any) {
    console.error('Debug user fetch failed:', e)
    return NextResponse.json(
      { error: e?.message || 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
