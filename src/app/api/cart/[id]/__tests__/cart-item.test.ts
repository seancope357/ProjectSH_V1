import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import * as cartItemRoute from '../../[id]/route'

vi.mock('@/lib/supabase-server', () => {
  return {
    createClient: vi.fn(),
  }
})

const { createClient } = await import('@/lib/supabase-server')

function makeSupabaseMock(options: {
  userId?: string | null
  updateResult?: any | null
  updateError?: any | null
  deleteError?: any | null
}) {
  const {
    userId = 'user-1',
    updateResult = { id: 'ci-1', quantity: 2 },
    updateError = null,
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
    let op: 'update' | 'delete' | null = null

    const builder: any = {
      update: vi.fn(() => {
        op = 'update'
        return builder
      }),
      delete: vi.fn(() => {
        op = 'delete'
        return builder
      }),
      eq: vi.fn((col: string, val: any) => {
        eqCalls.push([col, val])
        // For delete, allow multiple eq calls and resolve on await
        return builder
      }),
      select: vi.fn(() => builder),
      single: vi.fn(() =>
        Promise.resolve({ data: updateResult, error: updateError })
      ),
      then: undefined as any,
    }

    // If awaited directly on delete chain, resolve to delete result
    builder.then = (resolve: any) => {
      if (op === 'delete') {
        return resolve({ error: deleteError })
      }
      // No-op for other ops
      return resolve(undefined)
    }
    return builder
  })

  const supabase = { auth, from, __eqCalls: eqCalls }
  return supabase as any
}

describe('Cart item API (RLS/user-scoped)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('PATCH updates quantity for user-scoped item', async () => {
    const supabase = makeSupabaseMock({
      updateResult: { id: 'ci-1', quantity: 5 },
    })
    ;(createClient as any).mockResolvedValue(supabase)

    const req = new NextRequest('http://localhost/api/cart/ci-1', {
      method: 'PATCH',
      body: JSON.stringify({ quantity: 5 }),
    })

    const res = await cartItemRoute.PATCH(req, { params: { id: 'ci-1' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.item).toEqual({ id: 'ci-1', quantity: 5 })
    expect(supabase.__eqCalls).toContainEqual(['id', 'ci-1'])
    expect(supabase.__eqCalls).toContainEqual(['user_id', 'user-1'])
  })

  it('PATCH validates quantity', async () => {
    const supabase = makeSupabaseMock({})
    ;(createClient as any).mockResolvedValue(supabase)

    const req = new NextRequest('http://localhost/api/cart/ci-1', {
      method: 'PATCH',
      body: JSON.stringify({ quantity: 0 }),
    })

    const res = await cartItemRoute.PATCH(req, { params: { id: 'ci-1' } })
    expect(res.status).toBe(400)
  })

  it('DELETE removes item for the user', async () => {
    const supabase = makeSupabaseMock({ deleteError: null })
    ;(createClient as any).mockResolvedValue(supabase)

    const res = await cartItemRoute.DELETE(
      new NextRequest('http://localhost/api/cart/ci-1'),
      { params: { id: 'ci-1' } }
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ ok: true })
    expect(supabase.__eqCalls).toContainEqual(['id', 'ci-1'])
    expect(supabase.__eqCalls).toContainEqual(['user_id', 'user-1'])
  })

  it('routes return 401 when unauthenticated', async () => {
    const supabase = makeSupabaseMock({ userId: null })
    ;(createClient as any).mockResolvedValue(supabase)

    const req = new NextRequest('http://localhost/api/cart/ci-1', {
      method: 'PATCH',
      body: JSON.stringify({ quantity: 5 }),
    })

    const resPatch = await cartItemRoute.PATCH(req, { params: { id: 'ci-1' } })
    expect(resPatch.status).toBe(401)

    const resDelete = await cartItemRoute.DELETE(
      new NextRequest('http://localhost/api/cart/ci-1'),
      { params: { id: 'ci-1' } }
    )
    expect(resDelete.status).toBe(401)
  })
})
