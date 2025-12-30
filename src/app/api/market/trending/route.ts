import { NextResponse } from 'next/server'
import { getMarketInsights } from '@/lib/market-service'

export async function GET() {
  try {
    const insights = await getMarketInsights()
    return NextResponse.json(insights)
  } catch (error) {
    console.error('Failed to compute market insights:', error)
    return NextResponse.json(
      { error: 'Failed to compute market insights' },
      { status: 500 }
    )
  }
}
