import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { db, supabaseAdmin } from '@/lib/supabase-db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sequenceId: string }> }
) {
  try {
    const { sequenceId } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user has access to the requested sequence via downloads
    const downloads = await db.downloads.findMany(user.id)
    const target = (downloads || []).find((d: any) => {
      return d.sequence_id === sequenceId || d.sequences?.id === sequenceId
    })

    if (!target) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const fileUrl = target.sequences?.file_url || target.download_url
    if (!fileUrl) {
      return NextResponse.json({ error: 'File not available' }, { status: 503 })
    }

    // Increment download count (best-effort)
    try {
      if (target.id) {
        await db.downloads.incrementDownloadCount(target.id)
      }
    } catch (e) {
      console.warn('Failed to increment download count', e)
    }

    // Try to generate a signed URL if the file is in Supabase Storage
    try {
      const maybeSigned = await maybeCreateSignedUrl(fileUrl)
      if (maybeSigned) {
        return NextResponse.redirect(maybeSigned)
      }
    } catch (e) {
      console.warn(
        'Signed URL generation failed, falling back to direct URL',
        e
      )
    }

    // Fallback: redirect to the actual file URL
    return NextResponse.redirect(fileUrl)
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download sequence' },
      { status: 500 }
    )
  }
}

// Attempt to create a signed URL when fileUrl points to Supabase Storage
async function maybeCreateSignedUrl(fileUrl: string): Promise<string | null> {
  // Heuristics:
  // 1) If fileUrl is a relative path like "sequences/path/to/file", treat bucket "sequences".
  // 2) If fileUrl contains "/storage/v1/object/public/<bucket>/<path>", extract bucket and path.
  // 3) If fileUrl matches "supabase://<bucket>/<path>", parse accordingly.

  // Case 3: supabase://bucket/path
  if (fileUrl.startsWith('supabase://')) {
    const raw = fileUrl.replace('supabase://', '')
    const [bucket, ...rest] = raw.split('/')
    const path = rest.join('/')
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60)
    if (error) throw error
    return data?.signedUrl ?? null
  }

  // Case 2: public storage URL
  const publicPrefix = '/storage/v1/object/public/'
  try {
    const u = new URL(fileUrl)
    const idx = u.pathname.indexOf(publicPrefix)
    if (idx >= 0) {
      const after = u.pathname.slice(idx + publicPrefix.length)
      const [bucket, ...rest] = after.split('/')
      const path = rest.join('/')
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60)
      if (error) throw error
      return data?.signedUrl ?? null
    }
  } catch {
    // Not an absolute URL; fall through
  }

  // Case 1: relative path
  if (!fileUrl.startsWith('http')) {
    const [bucket, ...rest] = fileUrl.split('/')
    const path = rest.join('/')
    if (bucket && path) {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60)
      if (error) throw error
      return data?.signedUrl ?? null
    }
  }

  return null
}
