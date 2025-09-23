import { NextRequest, NextResponse } from 'next/server'
import { calculateCompatibilityScore, CompatibilityInput } from '@/lib/compatibility'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sequenceId, userInput }: { sequenceId: string; userInput: CompatibilityInput } = body

    if (!sequenceId || !userInput) {
      return NextResponse.json(
        { error: 'Missing sequenceId or userInput' },
        { status: 400 }
      )
    }

    // Get sequence compatibility profiles
    const compatibilityProfiles = await prisma.compatibilityProfile.findMany({
      where: { sequenceId },
    })

    if (compatibilityProfiles.length === 0) {
      return NextResponse.json(
        { error: 'No compatibility data found for this sequence' },
        { status: 404 }
      )
    }

    // Calculate scores for each compatibility profile
    const scores = compatibilityProfiles.map((profile) => {
      const sequenceCompat = {
        propName: profile.propName,
        propCount: profile.propCount,
        pixelCount: profile.pixelCount,
        difficulty: profile.difficulty || undefined,
      }

      const score = calculateCompatibilityScore(userInput, sequenceCompat)
      
      return {
        profileId: profile.id,
        propName: profile.propName,
        score,
      }
    })

    // Get the best score
    const bestScore = scores.reduce((best, current) => 
      current.score.totalScore > best.score.totalScore ? current : best
    )

    return NextResponse.json({
      sequenceId,
      bestScore: bestScore.score,
      allScores: scores,
    })
  } catch (error) {
    console.error('Compatibility scoring error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate compatibility score' },
      { status: 500 }
    )
  }
}