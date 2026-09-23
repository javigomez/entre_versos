import { expect, test } from '@jest/globals';
import { evaluateChallengeAnswer } from './challenge';
import type { Challenge } from './schemas';
const image: Challenge = { type: 'image-choice', id: 'viaje', mestre: 'M', prompt: 'P', options: [
  { id: 'nieve', text: 'NIEVE', image: { file: 'nieve.jpg', description: 'nieve' } },
  { id: 'playa', text: 'PLAYA', image: { file: 'playa.jpg', description: 'playa' } },
] };
test('image-choice completes either existing option and rejects unknown ids', () => {
  expect(evaluateChallengeAnswer(image, 'nieve')).toBe('completed');
  expect(evaluateChallengeAnswer(image, 'playa')).toBe('completed');
  expect(evaluateChallengeAnswer(image, 'otro')).toBe('invalid');
});

test('text-choice retries, completes or rejects by option id', () => {
  const challenge = {
    type: 'text-choice' as const, id: 'estrategia', mestre: 'M', prompt: 'P',
    options: [{ id: 'forcar', text: 'Forçar' }, { id: 'pont', text: 'Fer pont' }],
    correctOptionId: 'pont', success: 'Sí', retry: 'No',
  };
  expect(evaluateChallengeAnswer(challenge, 'altre')).toBe('invalid');
  expect(evaluateChallengeAnswer(challenge, 'forcar')).toBe('retry');
  expect(evaluateChallengeAnswer(challenge, 'pont')).toBe('completed');
});
