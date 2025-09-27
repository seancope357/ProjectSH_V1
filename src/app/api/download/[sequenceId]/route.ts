import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sequenceId: string }> }
) {
  try {
    const { sequenceId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implement file download with new storage solution
    return NextResponse.json(
      { error: 'Download functionality temporarily unavailable' },
      { status: 503 }
    )
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download sequence' },
      { status: 500 }
    )
  }
}