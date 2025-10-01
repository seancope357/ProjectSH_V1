import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implement sequence retrieval with Supabase
    return NextResponse.json(
      { error: 'Sequence retrieval functionality temporarily unavailable' },
      { status: 503 }
    )
  } catch (error) {
    console.error('Sequence retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve sequence' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implement sequence deletion with Supabase
    return NextResponse.json(
      { error: 'Sequence deletion functionality temporarily unavailable' },
      { status: 503 }
    )
  } catch (error) {
    console.error('Sequence deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete sequence' },
      { status: 500 }
    )
  }
}