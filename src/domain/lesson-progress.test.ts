import { expect, test } from '@jest/globals';
import { lessonProgressSchema, storedLessonProgressSchema } from './lesson-progress';

const body = { started: true, completed: ['q1'],
  history: [{ challengeId: 'q1', optionId: 'a' }] };

test('L04: normaliza legacy sin perder logros ni intentos', () => {
  const result = storedLessonProgressSchema.parse({ sessionId: 'lesson-1', ...body });
  expect(result).toEqual({ lessonId: 'lesson-1', ...body });
  expect(result).not.toHaveProperty('sessionId');
  expect(lessonProgressSchema.parse(result)).toEqual(result);
});

test('L04: el formato nuevo hace round trip', () => {
  const value = { lessonId: 'lesson-1', ...body };
  expect(storedLessonProgressSchema.parse(JSON.parse(JSON.stringify(value)))).toEqual(value);
});

test.each([
  null,
  { ...body },
  { sessionId: 42, ...body },
  { lessonId: 42, ...body },
  { sessionId: 'x', lessonId: 'x', ...body },
  { sessionId: 'x', lessonId: 'y', ...body },
  { lessonId: 'x', ...body, history: 'invalid' },
])('L04: rechaza guardado inválido o ambiguo %j', raw => {
  expect(storedLessonProgressSchema.safeParse(raw).success).toBe(false);
});
