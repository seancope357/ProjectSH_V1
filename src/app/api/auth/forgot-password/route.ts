import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectTo = `${appUrl}/auth/callback`

    const supabase = await createClient()
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      console.error('resetPasswordForEmail error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, redirect_to: redirectTo })
  } catch (e: any) {
    console.error('Forgot password API failed:', e)
    return NextResponse.json(
      { error: e?.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
