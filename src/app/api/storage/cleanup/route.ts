import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { bucket } = await request.json()

    if (!bucket || !['sequence-files', 'sequence-previews'].includes(bucket)) {
      return NextResponse.json({ error: 'Invalid bucket specified' }, { status: 400 })
    }

    // Get all files in the bucket
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from(bucket)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (listError) {
      console.error('List files error:', listError)
      return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
    }

    let orphanedFiles: string[] = []
    let cleanedCount = 0

    if (bucket === 'sequence-files') {
      // Check for orphaned sequence files
      const sequences = await prisma.sequence.findMany({
        select: { filePath: true },
        where: { filePath: { not: null } },
      })

      const validPaths = new Set(sequences.map((s: { filePath: string | null }) => s.filePath).filter(Boolean))
      
      for (const file of files || []) {
        const fullPath = file.name
        if (!validPaths.has(fullPath)) {
          orphanedFiles.push(fullPath)
        }
      }
    } else if (bucket === 'sequence-previews') {
      // Check for orphaned preview files
      const sequences = await prisma.sequence.findMany({
        select: { previewUrl: true },
        where: { previewUrl: { not: null } },
      })

      const validPaths = new Set(
        sequences
          .map((s: { previewUrl: string | null }) => s.previewUrl)
          .filter(Boolean)
          .map((url: string) => url.split('/').slice(-3).join('/'))
      )
      
      for (const file of files || []) {
        const fullPath = file.name
        if (!validPaths.has(fullPath)) {
          orphanedFiles.push(fullPath)
        }
      }
    }

    // Remove orphaned files in batches
    const batchSize = 100
    for (let i = 0; i < orphanedFiles.length; i += batchSize) {
      const batch = orphanedFiles.slice(i, i + batchSize)
      
      const { error: removeError } = await supabaseAdmin.storage
        .from(bucket)
        .remove(batch)

      if (removeError) {
        console.error('Remove files error:', removeError)
      } else {
        cleanedCount += batch.length
      }
    }

    return NextResponse.json({
      success: true,
      bucket,
      totalFiles: files?.length || 0,
      orphanedFiles: orphanedFiles.length,
      cleanedFiles: cleanedCount,
    })
  } catch (error) {
    console.error('Storage cleanup error:', error)
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    )
  }
}