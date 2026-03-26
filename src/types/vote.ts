export type VoteChoice = 'bullish' | 'bearish' | 'neutral'

export interface Question {
  id: string
  date: string
  title: string
  question: string
  category: string
  totalVotes: number
  deadline: string
  isActive: boolean
}

export interface CharacterPrediction {
  character: 'quant' | 'professor' | 'reporter' | 'pattern' | 'chimp'
  name: string
  emoji: string
  prediction: VoteChoice
  reasoning: string
  methodology: string
  reaction?: string
}

export interface CrowdResult {
  bullish: number
  bearish: number
  neutral: number
  totalVotes: number
}

export interface VoteResult {
  questionId: string
  title: string
  actualOutcome: VoteChoice
  crowdResult: CrowdResult
  characters: (CharacterPrediction & { isCorrect: boolean })[]
  aiComment: string
}
