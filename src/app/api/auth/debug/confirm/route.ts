import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-db'

export async function GET(request: NextRequest) {
  try {
    // Restrict in production unless explicitly enabled
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.ENABLE_DEBUG_ROUTES !== 'true'
    ) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const emailParam = url.searchParams.get('email')
    const redirectBase =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (!id && !emailParam) {
      return NextResponse.json(
        { error: 'id or email required' },
        { status: 400 }
      )
    }

    // Try to fetch email from user if not provided
    let email = emailParam || null
    if (id && !email) {
      const { data: userResp, error: userErr } =
        await supabaseAdmin.auth.admin.getUserById(id)
      if (userErr) {
        console.error('getUserById error:', userErr)
      }
      email = userResp?.user?.email || null
    }

    const redirectTo = `${redirectBase}/auth/callback`
    const attempts: any[] = []

    // 1) Preferred: email confirmation by user_id
    if (id) {
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'email_confirmation',
        user_id: id,
        options: { redirectTo },
      } as any)
      attempts.push({
        type: 'email_confirmation',
        ok: !error,
        error: error?.message,
      })
      if (!error) {
        const link = (data as any)?.properties?.action_link || null
        return NextResponse.json({
          action_link: link,
          redirect_to: redirectTo,
          attempts,
        })
      } else {
        console.warn('email_confirmation failed:', error?.message)
      }
    }

    // 2) Fallback: recovery link by email (if available)
    if (email) {
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo },
      } as any)
      attempts.push({ type: 'recovery', ok: !error, error: error?.message })
      if (!error) {
        const link = (data as any)?.properties?.action_link || null
        return NextResponse.json({
          action_link: link,
          redirect_to: redirectTo,
          attempts,
        })
      } else {
        console.warn('recovery failed:', error?.message)
      }
    }

    // 3) Fallback: invite link by email (if available)
    if (email) {
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email,
        options: { redirectTo },
      } as any)
      attempts.push({ type: 'invite', ok: !error, error: error?.message })
      if (!error) {
        const link = (data as any)?.properties?.action_link || null
        return NextResponse.json({
          action_link: link,
          redirect_to: redirectTo,
          attempts,
        })
      } else {
        console.warn('invite failed:', error?.message)
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate any link',
        attempts,
        hint: email
          ? 'Check Supabase Auth settings: email confirmation enabled, site URL, SMTP.'
          : 'User email not available; provide ?email=... to try recovery/invite.',
      },
      { status: 400 }
    )
  } catch (e: any) {
    console.error('Generate confirm link failed:', e)
    return NextResponse.json(
      { error: e?.message || 'Failed to generate link' },
      { status: 500 }
    )
  }
}
