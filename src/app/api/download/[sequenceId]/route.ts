import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { sequenceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sequenceId } = params

    // Check if user has purchased this sequence
    const purchase = await prisma.orderItem.findFirst({
      where: {
        sequenceId,
        order: {
          userId: session.user.id,
          status: 'COMPLETED',
        },
      },
      include: {
        sequence: {
          include: {
            versions: {
              where: { isActive: true },
              select: {
                fileUrl: true,
              },
              take: 1,
            },
          },
          select: {
            title: true,
          },
        },
      },
    })

    if (!purchase) {
      return NextResponse.json({ error: 'Sequence not purchased or access denied' }, { status: 403 })
    }

    const activeVersion = purchase.sequence.versions[0]
    if (!activeVersion?.fileUrl) {
      return NextResponse.json({ error: 'Sequence file not available' }, { status: 404 })
    }

    // Generate signed URL (valid for 1 hour)
    const { data, error } = await supabaseAdmin.storage
      .from('sequence-files')
      .createSignedUrl(activeVersion.fileUrl, 3600)

    if (error) {
      console.error('Signed URL error:', error)
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
    }

    // Log download for analytics
    await prisma.download.create({
      data: {
        userId: session.user.id,
        sequenceId,
        downloadedAt: new Date(),
      },
    })

    return NextResponse.json({
      downloadUrl: data.signedUrl,
      fileName: `${purchase.sequence.title}.zip`,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to generate download link' },
      { status: 500 }
    )
  }
}