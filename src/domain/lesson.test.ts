import { expect, test } from '@jest/globals';
import { conversation } from '../../tests/fixtures/conversation';
import { lessonSchema } from './schemas';
import { submitChallengeAnswer, challengesOf, initialProgress, restoreProgress } from './lesson';

test('challengesOf devuelve solo los retos single-choice en orden', () => {
  const challenges = challengesOf(conversation);
  expect(challenges.length).toBe(2);
  expect(challenges[0].id).toBe('q1');
  expect(challenges[1].id).toBe('q2');
});

test('ignora selecciones inválidas o anteriores al inicio', () => {
  const p = initialProgress(conversation);
  expect(submitChallengeAnswer(conversation, p, 'a')).toBe(p);
  const started = { ...p, started: true };
  expect(submitChallengeAnswer(conversation, started, 'inexistente')).toBe(started);
});

test('fallar no avanza el progreso; acertar suma el reto a completados', () => {
  const started = { ...initialProgress(conversation), started: true };
  const wrong = submitChallengeAnswer(conversation, started, 'b');
  expect(wrong.completed).toEqual([]);
  const correct = submitChallengeAnswer(conversation, wrong, 'a');
  expect(correct.completed).toEqual(['q1']);
});

test('restaura historial correcto y descarta guardados corruptos o de otro contenido', () => {
  const fresh = initialProgress(conversation);
  expect(restoreProgress(conversation, null)).toEqual(fresh);
  expect(restoreProgress(conversation, { ...fresh, lessonId: 'old' })).toEqual(fresh);
  expect(restoreProgress(conversation, { ...fresh, started: true, history: [{ challengeId: 'no-existe', optionId: 'a' }] })).toEqual(fresh);
  expect(restoreProgress(conversation, { ...fresh, completed: ['inventado'] })).toEqual(fresh);

  const started = { ...initialProgress(conversation), started: true };
  const advanced = submitChallengeAnswer(conversation, started, 'a');
  expect(restoreProgress(conversation, JSON.parse(JSON.stringify(advanced)))).toEqual(advanced);

  const finalProgress = submitChallengeAnswer(conversation, advanced, 'e');
  expect(submitChallengeAnswer(conversation, finalProgress, 'cualquiera')).toBe(finalProgress);
});

test.each(['solution', 'option', 'text'])('P01: conserva logro al cambiar %s', kind => {
  const saved = submitChallengeAnswer(conversation, { ...initialProgress(conversation), started: true }, 'a');
  const updated = lessonSchema.parse({ ...conversation,
    script: conversation.script.map(item => {
      if (item.type !== 'single-choice' || item.id !== 'q1') return item;
      if (kind === 'solution') return { ...item, correctOptionId: 'b' };
      if (kind === 'option') return { ...item, correctOptionId: 'new-a',
        options: item.options.map(o => o.id === 'a' ? { ...o, id: 'new-a' } : o) };
      return { ...item, prompt: 'Enunciado mejorado', master: 'Nueva explicación',
        success: 'Bien hecho', retry: 'Otra oportunidad',
        options: item.options.map(o => ({ ...o, text: `${o.text}!`, emoji: '✨' })) };
    }) });
  const restored = restoreProgress(updated, JSON.parse(JSON.stringify(saved)));
  expect(restored.completed).toEqual(['q1']);
  expect(restoreProgress(updated, restored)).toEqual(restored);
  expect(submitChallengeAnswer(updated, restored, 'e').completed).toEqual(['q1', 'q2']);
});

test.each([
  { completed: ['q2'] },
  { completed: ['q1', 'q1'] },
  { completed: ['inventado'] },
])('P04: rechaza completados inválidos $completed', ({ completed }) => {
  const fresh = initialProgress(conversation);
  expect(restoreProgress(conversation, { ...fresh, started: true, completed })).toEqual(fresh);
});

test('P06: conserva sesión finalizada y el reinicio sigue limpio', () => {
  const saved = submitChallengeAnswer(conversation,
    submitChallengeAnswer(conversation, { ...initialProgress(conversation), started: true }, 'a'), 'e');
  const updated = lessonSchema.parse({ ...conversation, script: conversation.script.map(item =>
    item.type === 'single-choice' ? { ...item, correctOptionId: item.options[1].id } : item) });
  expect(restoreProgress(updated, saved).completed).toEqual(['q1', 'q2']);
  expect(initialProgress(updated).completed).toEqual([]);
  expect(restoreProgress(updated, { ...saved, started: false })).toEqual(initialProgress(updated));
});
