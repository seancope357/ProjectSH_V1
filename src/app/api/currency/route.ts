import { NextResponse } from 'next/server'

// Cache the rates for a short period (e.g., 1 hour) to be polite to the public API
let cachedRates: Record<string, number> | null = null
let lastFetchTime = 0
const CACHE_DURATION = 3600 * 1000 // 1 hour

export async function GET() {
  try {
    const now = Date.now()
    if (cachedRates && now - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json({ rates: cachedRates, source: 'cache' })
    }

    // specific public API for currency exchange rates
    const res = await fetch('https://open.er-api.com/v6/latest/USD')
    if (!res.ok) {
      throw new Error('Failed to fetch rates')
    }

    const data = await res.json()
    cachedRates = data.rates
    lastFetchTime = now

    return NextResponse.json({ rates: cachedRates, source: 'api' })
  } catch (error) {
    console.error('Currency API error:', error)
    // Fallback to basic rates if API fails
    return NextResponse.json(
      {
        rates: { USD: 1, EUR: 0.92, GBP: 0.79, CAD: 1.35, AUD: 1.52 },
        source: 'fallback',
      },
      { status: 200 } // Return 200 with fallback to avoid breaking frontend
    )
  }
}
