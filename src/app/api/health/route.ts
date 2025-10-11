import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-db'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const startedAt = Date.now()

  // Gather env presence (no secrets leaked)
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  // Try a lightweight DB check
  let dbStatus: { ok: boolean; latency_ms?: number; error?: string } = {
    ok: false,
  }
  try {
    const t0 = Date.now()
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id')
      .limit(1)
    if (error) throw error
    dbStatus = { ok: true, latency_ms: Date.now() - t0 }
  } catch (e: any) {
    dbStatus = { ok: false, error: e?.message || 'db check failed' }
  }

  // Read version from package.json (best-effort)
  let version = 'unknown'
  try {
    const pkgPath = path.join(process.cwd(), 'package.json')
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    version = pkg.version || 'unknown'
  } catch {}

  const payload = {
    status: 'ok',
    version,
    uptime_seconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    started_ms_ago: Date.now() - startedAt,
    env,
    services: {
      supabase: dbStatus,
    },
  }

  return NextResponse.json(payload, { status: 200 })
}
