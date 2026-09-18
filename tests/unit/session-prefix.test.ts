import { expect, test } from '@jest/globals';
import { conversation } from '../fixtures/conversation';
import { initialProgress, submitChallengeAnswer } from '../../src/domain/lesson';
import { messagesFor } from '../../src/application/message-projector';

test('no revela el bloque posterior a un reto incompleto', () => {
  const p = { ...initialProgress(conversation), started: true };
  const text = messagesFor(conversation, p).map(m => m.text);
  expect(text).not.toContain('Ahora cambia el ejercicio.');
  expect(text).not.toContain('Vamos al siguiente.');
});

test('un intento añade respuesta y feedback sin alterar el prefijo', () => {
  const p = { ...initialProgress(conversation), started: true };
  const before = messagesFor(conversation, p);
  const after = messagesFor(conversation, submitChallengeAnswer(conversation, p, 'b'));
  expect(after.slice(0, before.length)).toEqual(before);
  expect(after.slice(before.length).map(m => m.text))
    .toEqual(['Suficiente', 'No es correcto. Prueba otra vez.']);
});

test('conserva intentos incorrectos y solo avanza tras acertar', () => {
  const started = { ...initialProgress(conversation), started: true };
  const once = submitChallengeAnswer(conversation, started, 'b');
  const twice = submitChallengeAnswer(conversation, once, 'c');
  const retryTexts = messagesFor(conversation, twice).map(m => m.text);
  expect(retryTexts).toContain('Suficiente');
  expect(retryTexts).toContain('Completo');
  expect(retryTexts).not.toContain('Ahora cambia el ejercicio.');

  const correct = submitChallengeAnswer(conversation, twice, 'a');
  const completedTexts = messagesFor(conversation, correct).map(m => m.text);
  expect(completedTexts).toContain('Ahora cambia el ejercicio.');
  expect(completedTexts).toContain('Vamos al siguiente.');
  expect(completedTexts).toContain('Una última pregunta.');
});

test('no expone q2 ni completion antes de sus turnos y los añade una vez al final', () => {
  let p = { ...initialProgress(conversation), started: true };
  p = submitChallengeAnswer(conversation, p, 'a');
  p = submitChallengeAnswer(conversation, p, 'e');
  const texts = messagesFor(conversation, p).map(m => m.text);
  expect(texts.filter(text => text === 'Fin del entrenamiento.')).toHaveLength(1);
  expect(texts.filter(text => text === 'Una última pregunta.')).toHaveLength(1);
});
