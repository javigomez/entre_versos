import { expect, test } from '@jest/globals';
import { createFlow } from '../../src/application/conversation-flow';
import { messagesFor } from '../../src/application/message-projector';
import { challengesOf, initialProgress, restoreProgress, submitChallengeAnswer } from '../../src/domain/lesson';
import { createYamlContentRepository } from '../../src/infrastructure/expo/content/yaml-content-repository';
import type { Lesson, Challenge, LessonStep } from '../../src/domain/schemas';
import { conversation } from '../fixtures/conversation';

const repo = createYamlContentRepository();

function isChallenge(item: LessonStep): item is Challenge {
  return item.type === 'single-choice';
}

test('el repositorio YAML carga el guion editorial con retos válidos', () => {
  const lesson: Lesson = repo.load();
  const challenges = lesson.script.filter(isChallenge);
  expect(challenges.length).toBeGreaterThanOrEqual(2);
  expect(challenges[0].options[0].emoji).toBe('🌊');
});

test('load() y restoreProgress() cierran el ciclo sobre el YAML real', () => {
  const lesson = repo.load();
  const challenges = lesson.script.filter(isChallenge);
  const history = challenges.map((c: Challenge) => ({ challengeId: c.id, optionId: c.correctOptionId }));
  const legacyProgress = { sessionId: lesson.id, started: true, completed: challenges.map((c: Challenge) => c.id), history };
  const restored = restoreProgress(lesson, JSON.parse(JSON.stringify(legacyProgress)));
  expect(restored).toEqual({ lessonId: lesson.id, started: true, completed: challenges.map((c: Challenge) => c.id), history });
  expect(JSON.parse(JSON.stringify(restored))).not.toHaveProperty('sessionId');
});

test('L04: restaura legacy y serializa exclusivamente lessonId', () => {
  const current = submitChallengeAnswer(conversation,
    { ...initialProgress(conversation), started: true }, 'a');
  const { lessonId, ...body } = current;
  const legacy = { sessionId: lessonId, ...body };
  const restored = restoreProgress(conversation, JSON.parse(JSON.stringify(legacy)));
  expect(restored).toEqual(current);
  const written = JSON.parse(JSON.stringify(restored));
  expect(written.lessonId).toBe(conversation.id);
  expect(written).not.toHaveProperty('sessionId');
  expect(restoreProgress(conversation, written)).toEqual(restored);
  expect(restoreProgress(conversation, { ...legacy, sessionId: 'another-lesson' }))
    .toEqual(initialProgress(conversation));
});

test('P08: sin guardado empieza al inicio; con logros no necesita historial', () => {
  const fresh = restoreProgress(conversation, null);
  expect(fresh).toEqual(initialProgress(conversation));
  expect(createFlow(conversation, fresh, false).revealed).toBe(0);
  const saved = { ...fresh, started: true, completed: ['q1'], history: [] };
  const restored = restoreProgress(conversation, JSON.parse(JSON.stringify(saved)));
  expect(restored).toEqual(saved);
  expect(challengesOf(conversation)[restored.completed.length].id).toBe('q2');
  expect(createFlow(conversation, restored, true).phase).toBe('waiting-choice');
});

test('P01/P02: tres retos, q1 superado y q2 con la solución actual', () => {
  const q2 = challengesOf(conversation)[1];
  const original: Lesson = {
    ...conversation,
    script: [...conversation.script, { ...q2, id: 'q3', prompt: 'Tercer reto' }],
  };
  const saved = submitChallengeAnswer(original, { ...initialProgress(original), started: true }, 'a');
  const current: Lesson = {
    ...original,
    script: original.script.map(item => {
      if (item.type !== 'single-choice') return item;
      if (item.id === 'q1') return { ...item, correctOptionId: 'b' };
      if (item.id === 'q2') {
        return {
          ...item,
          correctOptionId: 'f',
          options: item.options.map(option => option.id === 'f'
            ? { ...option, text: 'Respuesta actualizada' }
            : option),
        };
      }
      return item;
    }),
  };
  const resumed = restoreProgress(current, JSON.parse(JSON.stringify(saved)));
  expect(resumed.completed).toEqual(['q1']);
  const pending = challengesOf(current)[resumed.completed.length];
  expect(pending.id).toBe('q2');
  expect(pending.options.find(option => option.id === 'f')?.text).toBe('Respuesta actualizada');
  const wrong = submitChallengeAnswer(current, resumed, 'e');
  expect(wrong.completed).toEqual(['q1']);
  const correct = submitChallengeAnswer(current, wrong, 'f');
  expect(correct.completed).toEqual(['q1', 'q2']);
  expect(challengesOf(current)[correct.completed.length].id).toBe('q3');
  expect(createFlow(current, correct, true).phase).toBe('waiting-choice');
});

test('P07 / R03 / R09: persiste intentos nuevos después de descartar historial incompatible', () => {
  const old = submitChallengeAnswer(conversation, { ...initialProgress(conversation), started: true }, 'a');
  const updated: Lesson = {
    ...conversation,
    script: conversation.script.map(item => item.type === 'single-choice' && item.id === 'q1'
      ? { ...item, correctOptionId: 'b' }
      : item),
  };
  const restored = restoreProgress(updated, JSON.parse(JSON.stringify(old)));
  expect(restored.completed).toEqual(['q1']);
  expect(restored.history).toEqual([]);
  expect(messagesFor(updated, restored).some(message => message.id.startsWith('answer-'))).toBe(false);
  expect(createFlow(updated, restored, true).phase).toBe('waiting-choice');
  const wrong = submitChallengeAnswer(updated, restored, 'f');
  const resumed = restoreProgress(updated, JSON.parse(JSON.stringify(wrong)));
  expect(resumed).toEqual(wrong);
  expect(messagesFor(updated, resumed).map(message => message.text)).toContain('Callado');
  const finished = submitChallengeAnswer(updated, resumed, 'e');
  const reloaded = restoreProgress(updated, JSON.parse(JSON.stringify(finished)));
  expect(reloaded).toEqual(finished);
  expect(createFlow(updated, reloaded, true).phase).toBe('finished');
  expect(messagesFor(updated, reloaded).filter(message => message.id === 'completion')).toHaveLength(1);
});
