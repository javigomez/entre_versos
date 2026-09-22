import type { ImageChoiceChallenge, ScoredChallenge } from './schemas';
export type ChallengeAnswerResult = 'invalid' | 'retry' | 'completed';
export function evaluateChallengeAnswer(challenge: ScoredChallenge | ImageChoiceChallenge, optionId: string): ChallengeAnswerResult {
  if (!challenge.options.some(option => option.id === optionId)) return 'invalid';
  return challenge.type === 'image-choice' || challenge.correctOptionId === optionId ? 'completed' : 'retry';
}
