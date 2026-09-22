import { expect, test } from '@jest/globals';
import { conversation } from '../../tests/fixtures/conversation';
import { journeyLesson } from '../../tests/fixtures/journey';
import { initialProgress } from '../domain/lesson';
import { createFlow, reduceFlow } from './conversation-flow';
import type { Message } from './messages';
import { mixedJourneyLesson } from '../../tests/fixtures/mixedJourney';

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
  const afterMaster = reduceFlow(conversation, initial, { type: 'MESSAGE_DONE', token: 0, messageId: initial.messages[0].id });
  const started = reduceFlow(conversation, afterMaster, { type: 'START' });
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
  expect(s.messages.filter((m: Message) => m.text === 'Suficiente')).toHaveLength(1);
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
  expect(state.messages.filter((message: Message) => message.id === 'completion')).toHaveLength(1);
});

test('J01: una imagen elegida recorre la transición normal y desbloquea la siguiente pareja', () => {
  const lesson = { ...journeyLesson, startWithStudent: undefined };
  let state = createFlow(lesson, { ...initialProgress(lesson), started: true }, true);
  expect(state.phase).toBe('waiting-choice');

  state = reduceFlow(lesson, state, { type: 'ANSWER', controlId: 'n1-a', optionId: 'n1-a' });
  const token = state.token;
  expect(state.phase).toBe('pressing');
  state = reduceFlow(lesson, state, { type: 'PRESS_DONE', token });
  state = reduceFlow(lesson, state, { type: 'MOVE_DONE', token });
  state = reduceFlow(lesson, state, { type: 'PLACED', token });
  expect(state.messages[state.revealed]).toMatchObject({ role: 'player', text: 'Paso1a' });
  state = reduceFlow(lesson, state, { type: 'MESSAGE_DONE', token, messageId: state.messages[state.revealed].id });
  expect(state.phase).toBe('waiting-choice');
  expect(state.progress.history).toEqual([{ challengeId: 'viaje-palabras', optionId: 'n1-a' }]);
});

test('J07: el recorrido final espera la respuesta explícita del jugador', () => {
  const lesson = { ...journeyLesson, startWithStudent: undefined };
  const history = ['n1-a', 'n2-a', 'n3-a', 'n4-a', 'n5-a'].map(optionId => ({ challengeId: 'viaje-palabras', optionId }));
  let state = createFlow(lesson, { ...initialProgress(lesson), started: true, history }, true);
  expect(state.phase).toBe('waiting-choice');

  state = reduceFlow(lesson, state, { type: 'ANSWER', controlId: 'n6-a', optionId: 'n6-a' });
  const answerToken = state.token;
  state = reduceFlow(lesson, state, { type: 'PRESS_DONE', token: answerToken });
  state = reduceFlow(lesson, state, { type: 'MOVE_DONE', token: answerToken });
  state = reduceFlow(lesson, state, { type: 'PLACED', token: answerToken });
  expect(state.messages[state.revealed]).toMatchObject({ text: 'Nadar' });
  state = reduceFlow(lesson, state, { type: 'MESSAGE_DONE', token: answerToken, messageId: state.messages[state.revealed].id });
  state = reduceFlow(lesson, state, { type: 'MESSAGE_DONE', token: state.token, messageId: state.messages[state.revealed].id });
  expect(state.messages[state.revealed]).toMatchObject({ text: '¿Quieres ver el recorrido que has trazado?' });
  state = reduceFlow(lesson, state, { type: 'MESSAGE_DONE', token: state.token, messageId: state.messages[state.revealed].id });
  expect(state.phase).toBe('waiting-student');
  expect(state.messages[state.revealed]).toMatchObject({ action: 'VER MI RECORRIDO', text: 'Quiero ver el recorrido que he hecho.' });

  state = reduceFlow(lesson, state, { type: 'ACTIVATE_STUDENT', controlId: 'continue' });
  const routeToken = state.token;
  state = reduceFlow(lesson, state, { type: 'PRESS_DONE', token: routeToken });
  state = reduceFlow(lesson, state, { type: 'MOVE_DONE', token: routeToken });
  state = reduceFlow(lesson, state, { type: 'PLACED', token: routeToken });
  state = reduceFlow(lesson, state, { type: 'MESSAGE_DONE', token: routeToken, messageId: state.messages[state.revealed].id });
  expect(state.messages[state.revealed]).toMatchObject({ role: 'master', label: 'Tu recorrido', text: 'Viaje → Paso1a → Paso2a → Paso3a → Paso4a → Paso5a → Nadar' });
});

test('R17: el viatge espera EXPLICA-M\'HO abans del repte textual', () => {
  const lesson = { ...mixedJourneyLesson, startWithStudent: undefined };
  const history = ['n1-a', 'n2-a', 'n3-a', 'n4-a', 'n5-a']
    .map(optionId => ({ challengeId: 'viaje-palabras', optionId }));
  let state = createFlow(lesson, { ...initialProgress(lesson), started: true, history }, true);
  state = reduceFlow(lesson, state, { type: 'ANSWER', controlId: 'n6-a', optionId: 'n6-a' });
  const answerToken = state.token;
  for (const event of [
    { type: 'PRESS_DONE' as const, token: answerToken },
    { type: 'MOVE_DONE' as const, token: answerToken },
    { type: 'PLACED' as const, token: answerToken },
  ]) state = reduceFlow(lesson, state, event);
  while (!(state.phase === 'waiting-student' && state.messages[state.revealed]?.action === 'VER MI RECORRIDO')) {
    state = reduceFlow(lesson, state, { type: 'MESSAGE_DONE', token: state.token, messageId: state.messages[state.revealed].id });
  }
  state = reduceFlow(lesson, state, { type: 'ACTIVATE_STUDENT', controlId: 'continue' });
  const routeToken = state.token;
  for (const event of [
    { type: 'PRESS_DONE' as const, token: routeToken },
    { type: 'MOVE_DONE' as const, token: routeToken },
    { type: 'PLACED' as const, token: routeToken },
  ]) state = reduceFlow(lesson, state, event);
  while (state.phase === 'writing')
    state = reduceFlow(lesson, state, { type: 'MESSAGE_DONE', token: state.token, messageId: state.messages[state.revealed].id });
  expect(state.phase).toBe('waiting-student');
  expect(state.messages[state.revealed]).toMatchObject({
    role: 'player', action: "EXPLICA-M'HO", text: 'Vull aprendre el truc.',
  });
  state = reduceFlow(lesson, state, { type: 'ACTIVATE_STUDENT', controlId: 'continue' });
  const explainToken = state.token;
  for (const event of [
    { type: 'PRESS_DONE' as const, token: explainToken },
    { type: 'MOVE_DONE' as const, token: explainToken },
    { type: 'PLACED' as const, token: explainToken },
  ]) state = reduceFlow(lesson, state, event);
  state = reduceFlow(lesson, state, { type: 'MESSAGE_DONE', token: explainToken, messageId: state.messages[state.revealed].id });
  state = reduceFlow(lesson, state, { type: 'MESSAGE_DONE', token: state.token, messageId: state.messages[state.revealed].id });
  expect(state.phase).toBe('waiting-choice');
});
