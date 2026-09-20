import type { Challenge } from './schemas';
export type ChallengeAnswerResult = 'invalid' | 'retry' | 'completed';
export function evaluateChallengeAnswer(challenge: Challenge, optionId: string): ChallengeAnswerResult {
  if (!challenge.options.some(option => option.id === optionId)) return 'invalid';
  return challenge.type === 'image-choice' || challenge.correctOptionId === optionId ? 'completed' : 'retry';
}
