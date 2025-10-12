import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { db } from '@/lib/supabase-db'

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

    const downloads = await db.downloads.findMany(user.id)
    return NextResponse.json({ downloads }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to fetch downloads' },
      { status: 500 }
    )
  }
}
