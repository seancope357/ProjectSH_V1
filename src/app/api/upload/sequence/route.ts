import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implement sequence upload with new storage solution
    return NextResponse.json(
      { error: 'Sequence upload functionality temporarily unavailable' },
      { status: 503 }
    )
  } catch (error) {
    console.error('Sequence upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload sequence' },
      { status: 500 }
    )
  }
}