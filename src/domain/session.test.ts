import { expect, test } from '@jest/globals';
import { conversation } from '../../tests/fixtures/conversation';
import { answer, challengesOf, initialProgress, restoreProgress } from './session';

test('challengesOf devuelve solo los retos single-choice en orden', () => {
  const challenges = challengesOf(conversation);
  expect(challenges.length).toBe(2);
  expect(challenges[0].id).toBe('q1');
  expect(challenges[1].id).toBe('q2');
});

test('ignora selecciones inválidas o anteriores al inicio', () => {
  const p = initialProgress(conversation);
  expect(answer(conversation, p, 'a')).toBe(p);
  const started = { ...p, started: true };
  expect(answer(conversation, started, 'inexistente')).toBe(started);
});

test('fallar no avanza el progreso; acertar suma el reto a completados', () => {
  const started = { ...initialProgress(conversation), started: true };
  const wrong = answer(conversation, started, 'b');
  expect(wrong.completed).toEqual([]);
  const correct = answer(conversation, wrong, 'a');
  expect(correct.completed).toEqual(['q1']);
});

test('restaura historial correcto y descarta guardados corruptos o de otro contenido', () => {
  const fresh = initialProgress(conversation);
  expect(restoreProgress(conversation, null)).toEqual(fresh);
  expect(restoreProgress(conversation, { ...fresh, sessionId: 'old' })).toEqual(fresh);
  expect(restoreProgress(conversation, { ...fresh, started: true, history: [{ challengeId: 'no-existe', optionId: 'a' }] })).toEqual(fresh);
  expect(restoreProgress(conversation, { ...fresh, completed: ['inventado'] })).toEqual(fresh);

  const started = { ...initialProgress(conversation), started: true };
  const advanced = answer(conversation, started, 'a');
  expect(restoreProgress(conversation, JSON.parse(JSON.stringify(advanced)))).toEqual(advanced);

  const finalProgress = answer(conversation, advanced, 'e');
  expect(answer(conversation, finalProgress, 'cualquiera')).toBe(finalProgress);
});
