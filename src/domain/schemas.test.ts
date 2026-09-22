import { expect, test } from '@jest/globals';
import { lessonSchema, textChoiceChallengeSchema } from './schemas';
import { conversation } from '../../tests/fixtures/conversation';
import { journeyLesson } from '../../tests/fixtures/journey';

const script = conversation.script as unknown[];
const first = script.find((item): item is Record<string, unknown> => (item as { type: string }).type === 'single-choice')!;
const firstOptions = first.options as unknown[];

test('rechaza respuesta inexistente, IDs repetidos y opciones incompletas', () => {
  for (const patch of [
    { correctOptionId: 'no-existe' },
    { options: firstOptions.slice(1) },
    { options: Array(4).fill(firstOptions[0]) },
  ]) {
    const patchedScript = script.map((item: unknown) => item === first ? { ...first, ...patch } : item);
    const result = lessonSchema.safeParse({ ...conversation, script: patchedScript as typeof conversation.script });
    expect(result.success).toBe(false);
  }
  const duplicateResult = lessonSchema.safeParse({ ...conversation, script: [...script, first] as typeof conversation.script });
  expect(duplicateResult.success).toBe(false);
});

test('acepta exactamente dos opciones image-choice y rechaza campos de evaluación', () => {
  const challenge = { type: 'image-choice', id: 'viaje-inicial', master: 'Elige', prompt: '¿Por dónde?', options: [
    { id: 'nieve', text: 'NIEVE', image: { file: 'nieve.jpg', description: 'Sendero nevado' } },
    { id: 'playa', text: 'PLAYA', image: { file: 'playa.jpg', description: 'Camino al mar' } },
  ] };
  expect(lessonSchema.safeParse({ ...conversation, script: [...script, challenge] }).success).toBe(true);
  expect(lessonSchema.safeParse({ ...conversation, script: [...script, { ...challenge, correctOptionId: 'nieve' }] }).success).toBe(false);
});

const textChoice = {
  type: 'text-choice', id: 'estrategia-musica',
  master: 'Et llancen MÚSICA.', prompt: 'Què fas?',
  options: [
    { id: 'forcar', text: 'La poso al final i en forço la rima' },
    { id: 'pont', text: 'La poso dins i tanco amb CANTAR' },
  ],
  correctOptionId: 'pont', success: 'Exacte.', retry: 'Canvia la posició.',
} as const;

test('R15/R16: text-choice admet dues o quatre opcions textuals sense emoji', () => {
  expect(textChoiceChallengeSchema.parse(textChoice).options).toHaveLength(2);
  expect(textChoiceChallengeSchema.parse({
    ...textChoice,
    options: [...textChoice.options,
      { id: 'tema', text: 'Canvio de tema' },
      { id: 'repetir', text: 'Repeteixo MÚSICA' }],
  }).options).toHaveLength(4);
});

test.each([1, 3, 5])('rebutja text-choice amb %s opcions', count => {
  const options = Array.from({ length: count }, (_, index) => ({ id: `o-${index}`, text: `Opció ${index}` }));
  expect(() => textChoiceChallengeSchema.parse({ ...textChoice, options, correctOptionId: 'o-0' })).toThrow();
});

test('rebutja opcions textuals que convertirien el botó en un paràgraf', () => {
  const long = 'A'.repeat(45);
  expect(() => textChoiceChallengeSchema.parse({
    ...textChoice,
    options: [{ id: 'llarga', text: long }, textChoice.options[1]],
  })).toThrow();
});

test('admet un únic viatge abans de reptes textuals', () => {
  const journey = journeyLesson.script.find(step => step.type === 'image-journey')!;
  const lesson = { ...journeyLesson, script: [...journeyLesson.script, textChoice] };
  const secondJourney = { ...journey, id: 'viaje-dos' };
  expect(lessonSchema.safeParse(lesson).success).toBe(true);
  expect(lessonSchema.safeParse({ ...lesson, script: [...lesson.script, secondJourney] }).success).toBe(false);
});
