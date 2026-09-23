import { expect, test } from '@jest/globals';
import { conversation } from '../../tests/fixtures/conversation';
import { lessonSchema } from './schemas';
import { submitChallengeAnswer, challengesOf, initialProgress, restoreProgress } from './lesson';
import { journeyLesson } from '../../tests/fixtures/journey';
import { mixedJourneyLesson } from '../../tests/fixtures/mixedJourney';
import type { Lesson } from './schemas';

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
      return { ...item, prompt: 'Enunciado mejorado', mestre: 'Nueva explicación',
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

test('J06: restaura cada profundidad y completa únicamente el sexto tap', () => {
  let progress = { ...initialProgress(journeyLesson), started: true };
  for (let depth = 0; depth <= 6; depth++) {
    expect(restoreProgress(journeyLesson, JSON.parse(JSON.stringify(progress)))).toEqual(progress);
    expect(progress.completed).toEqual(depth === 6 ? ['viaje-palabras'] : []);
    expect(progress.history).toHaveLength(depth);
    if (depth < 6) progress = submitChallengeAnswer(journeyLesson, progress, `n${depth + 1}-a`);
  }
  expect(submitChallengeAnswer(journeyLesson, progress, 'n6-b')).toBe(progress);
});

test('J06: rechaza guardados contradictorios del viaje', () => {
  const fresh = initialProgress(journeyLesson);
  expect(restoreProgress(journeyLesson, { ...fresh, started: true, completed: ['viaje-palabras'] })).toEqual(fresh);
  expect(restoreProgress(journeyLesson, {
    ...fresh, started: true, history: [{ challengeId: 'viaje-palabras', optionId: 'n3-a' }],
  })).toEqual(fresh);
});

test('R17: restaura el viatge complet i el repte textual posterior', () => {
  let progress = { ...initialProgress(mixedJourneyLesson), started: true };
  for (const id of ['n1-a', 'n2-a', 'n3-a', 'n4-a', 'n5-a', 'n6-a'])
    progress = submitChallengeAnswer(mixedJourneyLesson, progress, id);
  const wrong = submitChallengeAnswer(mixedJourneyLesson, progress, 'pintar');
  expect(wrong.completed).toEqual(['viaje-palabras']);
  expect(restoreProgress(mixedJourneyLesson, structuredClone(wrong))).toEqual(wrong);
  const correct = submitChallengeAnswer(mixedJourneyLesson, wrong, 'cantar');
  expect(restoreProgress(mixedJourneyLesson, structuredClone(correct))).toEqual(correct);
});

test('J06/R17: un viatge complet necessita les sis eleccions encara que hi hagi reptes posteriors', () => {
  const raw = {
    ...initialProgress(mixedJourneyLesson), started: true,
    completed: ['viaje-palabras'], history: [],
  };
  expect(restoreProgress(mixedJourneyLesson, raw)).toEqual(initialProgress(mixedJourneyLesson));
});

test('P01/R17: conserva el recorregut si canvia la solució d’un repte textual superat', () => {
  let saved = { ...initialProgress(mixedJourneyLesson), started: true };
  for (const id of ['n1-a', 'n2-a', 'n3-a', 'n4-a', 'n5-a', 'n6-a', 'cantar'])
    saved = submitChallengeAnswer(mixedJourneyLesson, saved, id);
  const updated = {
    ...mixedJourneyLesson,
    script: mixedJourneyLesson.script.map(step => step.type === 'text-choice'
      ? { ...step, correctOptionId: 'pintar' }
      : step),
  } satisfies Lesson;
  const restored = restoreProgress(updated, structuredClone(saved));
  expect(restored.completed).toEqual(['viaje-palabras', 'porta-musica']);
  expect(restored.history.map(entry => entry.challengeId)).toEqual(Array(6).fill('viaje-palabras'));
});
