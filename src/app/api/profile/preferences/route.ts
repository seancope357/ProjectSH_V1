import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

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

    // Get user profile with navigation preferences
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(
        'role, default_role, last_role, last_buyer_path, last_seller_path'
      )
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      preferences: {
        role: profile?.role || 'BUYER',
        defaultRole: profile?.default_role || 'BUYER',
        lastRole: profile?.last_role || 'BUYER',
        lastBuyerPath: profile?.last_buyer_path || '/',
        lastSellerPath: profile?.last_seller_path || '/seller',
      },
    })
  } catch (error) {
    console.error('Error in preferences GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { lastRole, lastBuyerPath, lastSellerPath, defaultRole } = body

    // Validate input
    const validRoles = ['BUYER', 'SELLER', 'ADMIN']
    if (lastRole && !validRoles.includes(lastRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    if (defaultRole && !validRoles.includes(defaultRole)) {
      return NextResponse.json(
        { error: 'Invalid default role' },
        { status: 400 }
      )
    }

    // Update preferences
    const updateData: any = {}
    if (lastRole !== undefined) updateData.last_role = lastRole
    if (lastBuyerPath !== undefined) updateData.last_buyer_path = lastBuyerPath
    if (lastSellerPath !== undefined)
      updateData.last_seller_path = lastSellerPath
    if (defaultRole !== undefined) updateData.default_role = defaultRole

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating preferences:', updateError)
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in preferences PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
