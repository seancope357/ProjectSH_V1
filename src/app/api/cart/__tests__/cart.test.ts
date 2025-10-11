import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import * as cartRoute from '../route'

// Mock supabase-server createClient
vi.mock('@/lib/supabase-server', () => {
  return {
    createClient: vi.fn(),
  }
})

const { createClient } = await import('@/lib/supabase-server')

function makeSupabaseMock(options: {
  userId?: string | null
  getItemsResult?: any[] | null
  getItemsError?: any | null
  insertResult?: any | null
  insertError?: any | null
  deleteError?: any | null
}) {
  const {
    userId = 'user-1',
    getItemsResult = [],
    getItemsError = null,
    insertResult = null,
    insertError = null,
    deleteError = null,
  } = options

  const auth = {
    getUser: vi.fn(async () => ({
      data: { user: userId ? { id: userId } : null },
      error: null,
    })),
  }

  const eqCalls: Array<[string, any]> = []

  const from = vi.fn((table: string) => {
    if (table !== 'cart_items') throw new Error('Unexpected table: ' + table)
    let op: 'get' | 'insert' | 'delete' | null = null

    const builder: any = {
      select: vi.fn(() => builder),
      single: vi.fn(() =>
        Promise.resolve({ data: insertResult, error: insertError })
      ),
      insert: vi.fn(() => {
        op = 'insert'
        return builder
      }),
      delete: vi.fn(() => {
        op = 'delete'
        return builder
      }),
      eq: vi.fn((col: string, val: any) => {
        eqCalls.push([col, val])
        if (op === 'delete') {
          return Promise.resolve({ error: deleteError })
        }
        if (op === 'insert') {
          // The insert terminal is .single() which we already stubbed above
          return builder
        }
        // GET terminal: awaiting eq returns { data, error }
        return Promise.resolve({ data: getItemsResult, error: getItemsError })
      }),
    }
    return builder
  })

  const supabase = { auth, from, __eqCalls: eqCalls }
  return supabase as any
}

describe('Cart API (RLS/user-scoped)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET returns items for the authenticated user', async () => {
    const supabase = makeSupabaseMock({
      userId: 'user-123',
      getItemsResult: [{ id: 'ci1' }],
    })
    ;(createClient as any).mockResolvedValue(supabase)

    const res = await cartRoute.GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.items).toEqual([{ id: 'ci1' }])
    // Ensure query is scoped by user_id
    expect(supabase.__eqCalls).toContainEqual(['user_id', 'user-123'])
  })

  it('GET requires auth', async () => {
    const supabase = makeSupabaseMock({ userId: null })
    ;(createClient as any).mockResolvedValue(supabase)

    const res = await cartRoute.GET()
    expect(res.status).toBe(401)
  })

  it('POST inserts item and returns 201', async () => {
    const supabase = makeSupabaseMock({ insertResult: { id: 'ci2' } })
    ;(createClient as any).mockResolvedValue(supabase)

    const req = new NextRequest('http://localhost/api/cart', {
      method: 'POST',
      body: JSON.stringify({ sequenceId: 'seq-1' }),
    })

    const res = await cartRoute.POST(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.item).toEqual({ id: 'ci2' })
  })

  it('POST duplicate gracefully returns ok:true', async () => {
    const supabase = makeSupabaseMock({
      insertResult: null,
      insertError: { message: 'duplicate key', code: '23505' },
    })
    ;(createClient as any).mockResolvedValue(supabase)

    const req = new NextRequest('http://localhost/api/cart', {
      method: 'POST',
      body: JSON.stringify({ sequenceId: 'seq-1' }),
    })

    const res = await cartRoute.POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ ok: true })
  })

  it('POST validates sequenceId', async () => {
    const supabase = makeSupabaseMock({})
    ;(createClient as any).mockResolvedValue(supabase)

    const req = new NextRequest('http://localhost/api/cart', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await cartRoute.POST(req)
    expect(res.status).toBe(400)
  })

  it('DELETE clears cart for user', async () => {
    const supabase = makeSupabaseMock({ deleteError: null })
    ;(createClient as any).mockResolvedValue(supabase)

    const res = await cartRoute.DELETE()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ ok: true })
    // Verify user scoping applied
    expect(supabase.__eqCalls).toContainEqual(['user_id', 'user-1'])
  })
})
