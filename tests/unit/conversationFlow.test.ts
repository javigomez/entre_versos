import { expect, test } from '@jest/globals';
import { conversation } from '../fixtures/conversation';
import { initialProgress } from '../../src/domain/lesson';
import { createFlow, reduceFlow } from '../../src/application/conversation-flow';

test('Continuar espera colocación y no adelanta al siguiente jugador', () => {
  let s = createFlow(conversation, initialProgress(conversation), false);
  s = reduceFlow(conversation, s, { type: 'MESSAGE_DONE', token: s.token, messageId: s.messages[s.revealed].id });
  expect(s.phase).toBe('waiting-start');
  s = reduceFlow(conversation, s, { type: 'START' });
  expect(s.phase).toBe('waiting-student');
  s = reduceFlow(conversation, s, { type: 'ACTIVATE_STUDENT', controlId: 'continue' });
  expect(s.phase).toBe('pressing');
  const token = s.token;
  s = reduceFlow(conversation, s, { type: 'PRESS_DONE', token });
  s = reduceFlow(conversation, s, { type: 'MOVE_DONE', token });
  expect(s.phase).toBe('placing');
  expect(s.pending?.messageId).toBe(s.messages[s.revealed].id);
  s = reduceFlow(conversation, s, { type: 'PLACED', token });
  expect(s.messages[s.revealed].text).toBe('Quiero practicar.');
  const playerId = s.messages[s.revealed].id;
  s = reduceFlow(conversation, s, { type: 'MESSAGE_DONE', token, messageId: playerId });
  expect(s.messages[s.revealed].text).toBe('Verso 1\nVerso 2\nVerso 3\nVerso 4');
  expect(s.anchorId).toBe(playerId);
  s = reduceFlow(conversation, s, { type: 'MESSAGE_DONE', token: s.token, messageId: s.messages[s.revealed].id });
  expect(s.phase).toBe('waiting-student');
  expect(s.messages[s.revealed].text).toBe('Estoy preparado.');
});

test('rechaza activaciones, respuestas y callbacks duplicados o antiguos', () => {
  const initial = createFlow(conversation, initialProgress(conversation), false);
  expect(reduceFlow(conversation, initial, { type: 'START' })).toBe(initial);
  const afterMestre = reduceFlow(conversation, initial, { type: 'MESSAGE_DONE', token: 0, messageId: initial.messages[0].id });
  const started = reduceFlow(conversation, afterMestre, { type: 'START' });
  const pressing = reduceFlow(conversation, started, { type: 'ACTIVATE_STUDENT', controlId: 'continue' });
  const old = reduceFlow(conversation, pressing, { type: 'RESET' });
  expect(reduceFlow(conversation, old, { type: 'PRESS_DONE', token: pressing.token })).toBe(old);
  expect(reduceFlow(conversation, old, { type: 'MESSAGE_DONE', token: pressing.token, messageId: 'student-1' })).toBe(old);
});

test('respuesta incorrecta vuelve a elegir tras feedback y la correcta avanza', () => {
  let p = { ...initialProgress(conversation), started: true };
  let s = createFlow(conversation, p, true);
  while (s.phase !== 'waiting-choice') {
    if (s.phase !== 'writing') throw new Error(`fase inesperada ${s.phase}`);
    s = reduceFlow(conversation, s, { type: 'MESSAGE_DONE', token: s.token, messageId: s.messages[s.revealed].id });
  }
  s = reduceFlow(conversation, s, { type: 'ANSWER', controlId: 'b', optionId: 'b' });
  const token = s.token;
  s = reduceFlow(conversation, s, { type: 'PRESS_DONE', token });
  s = reduceFlow(conversation, s, { type: 'MOVE_DONE', token });
  s = reduceFlow(conversation, s, { type: 'PLACED', token });
  s = reduceFlow(conversation, s, { type: 'MESSAGE_DONE', token, messageId: s.messages[s.revealed].id });
  s = reduceFlow(conversation, s, { type: 'MESSAGE_DONE', token: s.token, messageId: s.messages[s.revealed].id });
  expect(s.phase).toBe('waiting-choice');
  expect(s.messages.filter(m => m.text === 'Suficiente')).toHaveLength(1);
});

test('MESSAGE_DONE duplicado o con ID equivocado no avanza dos veces', () => {
  const initial = createFlow(conversation, initialProgress(conversation), false);
  const done = reduceFlow(conversation, initial, { type: 'MESSAGE_DONE', token: 0, messageId: initial.messages[0].id });
  const duplicate = reduceFlow(conversation, done, { type: 'MESSAGE_DONE', token: 0, messageId: initial.messages[0].id });
  expect(duplicate).toBe(done);
  expect(reduceFlow(conversation, done, { type: 'MESSAGE_DONE', token: 0, messageId: 'wrong' })).toBe(done);
});

test('sesión restaurada completa termina sin añadir otro completion', () => {
  const progress = { ...initialProgress(conversation), started: true, completed: ['q1', 'q2'], history: [
    { challengeId: 'q1', optionId: 'a' }, { challengeId: 'q2', optionId: 'e' },
  ] };
  const state = createFlow(conversation, progress, true);
  expect(state.phase).toBe('finished');
  expect(state.messages.filter(message => message.id === 'completion')).toHaveLength(1);
});
