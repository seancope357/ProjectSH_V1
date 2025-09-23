export interface CompatibilityInput {
  userProps: {
    name: string
    count: number
  }[]
  userPixelCount: number
  userDifficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export interface SequenceCompatibility {
  propName: string
  propCount: number
  pixelCount: number
  difficulty?: string
}

export interface CompatibilityScore {
  totalScore: number
  propScore: number
  pixelScore: number
  difficultyPenalty: number
  breakdown: {
    propMatches: { name: string; score: number; type: 'exact' | 'partial' }[]
    pixelProximity: number
    difficultyMismatch: boolean
  }
}

export function calculateCompatibilityScore(
  userInput: CompatibilityInput,
  sequenceCompat: SequenceCompatibility
): CompatibilityScore {
  let propScore = 0
  const propMatches: { name: string; score: number; type: 'exact' | 'partial' }[] = []

  // Calculate prop name scoring
  for (const userProp of userInput.userProps) {
    const exactMatch = userProp.name.toLowerCase() === sequenceCompat.propName.toLowerCase()
    const partialMatch = userProp.name.toLowerCase().includes(sequenceCompat.propName.toLowerCase()) ||
                        sequenceCompat.propName.toLowerCase().includes(userProp.name.toLowerCase())

    if (exactMatch) {
      propScore += 5
      propMatches.push({ name: userProp.name, score: 5, type: 'exact' })
    } else if (partialMatch) {
      propScore += 2
      propMatches.push({ name: userProp.name, score: 2, type: 'partial' })
    }
  }

  // Calculate pixel count proximity scoring
  let pixelScore = 0
  const pixelDifference = Math.abs(userInput.userPixelCount - sequenceCompat.pixelCount)
  const pixelProximity = pixelDifference / Math.max(userInput.userPixelCount, sequenceCompat.pixelCount)

  if (pixelProximity <= 0.05) { // ≤5%
    pixelScore = 3
  } else if (pixelProximity <= 0.10) { // ≤10%
    pixelScore = 2
  } else if (pixelProximity <= 0.20) { // ≤20%
    pixelScore = 1
  }

  // Calculate difficulty mismatch penalty
  let difficultyPenalty = 0
  let difficultyMismatch = false

  if (userInput.userDifficulty === 'beginner' && sequenceCompat.difficulty === 'advanced') {
    difficultyPenalty = -2
    difficultyMismatch = true
  }

  const totalScore = Math.max(0, propScore + pixelScore + difficultyPenalty)

  return {
    totalScore,
    propScore,
    pixelScore,
    difficultyPenalty,
    breakdown: {
      propMatches,
      pixelProximity,
      difficultyMismatch,
    },
  }
}