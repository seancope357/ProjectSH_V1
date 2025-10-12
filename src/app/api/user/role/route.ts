import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await request.json()

    if (!role || !['USER', 'SELLER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Update user metadata with the new role
    const { data, error } = await supabase.auth.updateUser({
      data: {
        role: role,
        role_updated_at: new Date().toISOString(),
      },
    })

    if (error) {
      console.error('Supabase user update error:', error)
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: `Role updated to ${role}`,
    })
  } catch (error) {
    console.error('User role update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}
