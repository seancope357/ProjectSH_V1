import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(
        'full_name, username, avatar_url, bio, website_url, stripe_onboarding_complete'
      )
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to load profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile: data }, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch setup profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch setup profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      full_name,
      username,
      avatar_url,
      bio,
      website_url,
      stripe_onboarding_complete,
    } = body

    if (!full_name || !username || !bio) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        username,
        avatar_url,
        bio,
        website_url,
        stripe_onboarding_complete: !!stripe_onboarding_complete,
      })
      .eq('id', user.id)
      .select(
        'full_name, username, avatar_url, bio, website_url, stripe_onboarding_complete'
      )
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, profile: data }, { status: 200 })
  } catch (error) {
    console.error('Failed to update setup profile:', error)
    return NextResponse.json(
      { error: 'Failed to update setup profile' },
      { status: 500 }
    )
  }
}
