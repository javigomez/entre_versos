import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { lessonSchema } from '../src/domain/schemas';
import { challengesOf, initialProgress, restoreProgress, submitChallengeAnswer } from '../src/domain/lesson';
import { messagesFor } from '../src/application/message-projector';
const raw = parse(readFileSync(new URL('../src/infrastructure/expo/content/training.yaml', import.meta.url), 'utf8'));
const lesson = lessonSchema.parse(raw);
test('rechaza respuesta inexistente, IDs repetidos y opciones incompletas', () => {
  const first = raw.script.find((item: { type: string }) => item.type === 'single-choice');
  for (const patch of [{ correctOptionId: 'no-existe' }, { options: first.options.slice(1) }, { options: Array(4).fill(first.options[0]) }])
    assert.equal(lessonSchema.safeParse({ ...raw, script: raw.script.map((item: unknown) => item === first ? { ...first, ...patch } : item) }).success, false);
  assert.equal(lessonSchema.safeParse({ ...raw, script: [...raw.script, first] }).success, false);
});
test('fallar permite reintentar sin perder progreso; aciertos terminan la sesión', () => {
  const challenges = challengesOf(lesson);
  const first = challenges[0];
  const firstWrong = first.options.find(option => option.id !== first.correctOptionId)!;
  let p = { ...initialProgress(lesson), started: true };
  p = submitChallengeAnswer(lesson, p, firstWrong.id);
  assert.deepEqual(p.completed, []);
  assert.match(messagesFor(lesson, p).find(message => message.id.startsWith('feedback-'))!.text, /Prueba|busca|encaja|otro|precis|ronda/iu);
  p = submitChallengeAnswer(lesson, p, first.correctOptionId);
  assert.equal(p.completed.length, 1);
  for (const challenge of challenges.slice(1)) {
    p = submitChallengeAnswer(lesson, p, challenge.correctOptionId);
  }
  assert.equal(p.completed.length, challenges.length);
  assert.equal(messagesFor(lesson, p).at(-1)!.id, 'completion');
  assert.deepEqual(restoreProgress(lesson, JSON.parse(JSON.stringify(p))), p);
  assert.equal(submitChallengeAnswer(lesson, p, 'semaforo'), p);
});
test('ignora selecciones inválidas o anteriores al inicio', () => {
  const p = initialProgress(lesson);
  assert.equal(submitChallengeAnswer(lesson, p, 'claridad'), p);
  const started = { ...p, started: true };
  assert.equal(submitChallengeAnswer(lesson, started, 'inexistente'), started);
});
test('restaura historial y descarta guardados corruptos o de otro contenido', () => {
  const fresh = initialProgress(lesson);
  assert.deepEqual(restoreProgress(lesson, null), fresh);
  assert.deepEqual(restoreProgress(lesson, { ...fresh, lessonId: 'old' }), fresh);
  assert.deepEqual(restoreProgress(lesson, { ...fresh, started: true, history: [{ challengeId: 'no-existe', optionId: 'claridad' }] }), fresh);
  assert.deepEqual(restoreProgress(lesson, { ...fresh, completed: ['inventado'] }), fresh);
});
