import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { sessionSchema } from '../src/domain/schemas';
import { answer, challengesOf, initialProgress, restoreProgress } from '../src/domain/session';
import { messagesFor } from '../src/application/message-projector';
const raw = parse(readFileSync(new URL('../src/infrastructure/expo/content/training.yaml', import.meta.url), 'utf8'));
const session = sessionSchema.parse(raw);
test('rechaza respuesta inexistente, IDs repetidos y opciones incompletas', () => {
  const first = raw.script.find((item: { type: string }) => item.type === 'single-choice');
  for (const patch of [{ correctOptionId: 'no-existe' }, { options: first.options.slice(1) }, { options: Array(4).fill(first.options[0]) }])
    assert.equal(sessionSchema.safeParse({ ...raw, script: raw.script.map((item: unknown) => item === first ? { ...first, ...patch } : item) }).success, false);
  assert.equal(sessionSchema.safeParse({ ...raw, script: [...raw.script, first] }).success, false);
});
test('fallar permite reintentar sin perder progreso; aciertos terminan la sesión', () => {
  const challenges = challengesOf(session);
  const first = challenges[0];
  const firstWrong = first.options.find(option => option.id !== first.correctOptionId)!;
  let p = { ...initialProgress(session), started: true };
  p = answer(session, p, firstWrong.id);
  assert.deepEqual(p.completed, []);
  assert.match(messagesFor(session, p).find(message => message.id.startsWith('feedback-'))!.text, /Prueba|busca|encaja|otro|precis|ronda/iu);
  p = answer(session, p, first.correctOptionId);
  assert.equal(p.completed.length, 1);
  for (const challenge of challenges.slice(1)) {
    p = answer(session, p, challenge.correctOptionId);
  }
  assert.equal(p.completed.length, challenges.length);
  assert.equal(messagesFor(session, p).at(-1)!.id, 'completion');
  assert.deepEqual(restoreProgress(session, JSON.parse(JSON.stringify(p))), p);
  assert.equal(answer(session, p, 'semaforo'), p);
});
test('ignora selecciones inválidas o anteriores al inicio', () => {
  const p = initialProgress(session);
  assert.equal(answer(session, p, 'claridad'), p);
  const started = { ...p, started: true };
  assert.equal(answer(session, started, 'inexistente'), started);
});
test('restaura historial y descarta guardados corruptos o de otro contenido', () => {
  const fresh = initialProgress(session);
  assert.deepEqual(restoreProgress(session, null), fresh);
  assert.deepEqual(restoreProgress(session, { ...fresh, sessionId: 'old' }), fresh);
  assert.deepEqual(restoreProgress(session, { ...fresh, started: true, history: [{ challengeId: 'no-existe', optionId: 'claridad' }] }), fresh);
  assert.deepEqual(restoreProgress(session, { ...fresh, completed: ['inventado'] }), fresh);
});
