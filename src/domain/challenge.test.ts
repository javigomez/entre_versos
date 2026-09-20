import { expect, test } from '@jest/globals';
import { evaluateChallengeAnswer } from './challenge';
import type { Challenge } from './schemas';
const image: Challenge = { type: 'image-choice', id: 'viaje', master: 'M', prompt: 'P', options: [
  { id: 'nieve', text: 'NIEVE', image: { file: 'nieve.jpg', description: 'nieve' } },
  { id: 'playa', text: 'PLAYA', image: { file: 'playa.jpg', description: 'playa' } },
] };
test('image-choice completes either existing option and rejects unknown ids', () => {
  expect(evaluateChallengeAnswer(image, 'nieve')).toBe('completed');
  expect(evaluateChallengeAnswer(image, 'playa')).toBe('completed');
  expect(evaluateChallengeAnswer(image, 'otro')).toBe('invalid');
});
