import { expect, test } from '@jest/globals';
import { conversation } from '../../tests/fixtures/conversation';
import { initialProgress, submitChallengeAnswer } from '../domain/lesson';
import { messagesFor } from './message-projector';
import type { Message } from './messages';
import { mixedJourneyLesson } from '../../tests/fixtures/mixedJourney';

test('no revela el bloque posterior a un reto incompleto', () => {
  const p = { ...initialProgress(conversation), started: true };
  const text = messagesFor(conversation, p).map((m: Message) => m.text);
  expect(text).not.toContain('Ahora cambia el ejercicio.');
  expect(text).not.toContain('Vamos al siguiente.');
});

test('un intento añade respuesta y feedback sin alterar el prefijo', () => {
  const p = { ...initialProgress(conversation), started: true };
  const before = messagesFor(conversation, p);
  const after = messagesFor(conversation, submitChallengeAnswer(conversation, p, 'b'));
  expect(after.slice(0, before.length)).toEqual(before);
  expect(after.slice(before.length).map((m: Message) => m.text))
    .toEqual(['Suficiente', 'No es correcto. Prueba otra vez.']);
});

test('conserva intentos incorrectos y solo avanza tras acertar', () => {
  const started = { ...initialProgress(conversation), started: true };
  const once = submitChallengeAnswer(conversation, started, 'b');
  const twice = submitChallengeAnswer(conversation, once, 'c');
  const retryTexts = messagesFor(conversation, twice).map((m: Message) => m.text);
  expect(retryTexts).toContain('Suficiente');
  expect(retryTexts).toContain('Completo');
  expect(retryTexts).not.toContain('Ahora cambia el ejercicio.');

  const correct = submitChallengeAnswer(conversation, twice, 'a');
  const completedTexts = messagesFor(conversation, correct).map((m: Message) => m.text);
  expect(completedTexts).toContain('Ahora cambia el ejercicio.');
  expect(completedTexts).toContain('Vamos al siguiente.');
  expect(completedTexts).toContain('Una última pregunta.');
});

test('no expone q2 ni completion antes de sus turnos y los añade una vez al final', () => {
  let p = { ...initialProgress(conversation), started: true };
  p = submitChallengeAnswer(conversation, p, 'a');
  p = submitChallengeAnswer(conversation, p, 'e');
  const messages = messagesFor(conversation, p);
  const texts = messages.map((m: Message) => m.text);
  expect(texts.filter((text: string) => text === 'Fin del entrenamiento.')).toHaveLength(1);
  expect(texts.filter((text: string) => text === 'Una última pregunta.')).toHaveLength(1);
  expect(messages.find((m: Message) => m.id === 'completion')?.label).toBe('Entrenamiento completado');
});

test('R17: projecta J07, la resposta narrativa i el primer repte en ordre', () => {
  let afterJourney = { ...initialProgress(mixedJourneyLesson), started: true };
  for (const id of ['n1-a', 'n2-a', 'n3-a', 'n4-a', 'n5-a', 'n6-a'])
    afterJourney = submitChallengeAnswer(mixedJourneyLesson, afterJourney, id);
  const messages = messagesFor(mixedJourneyLesson, afterJourney);
  expect(messages.slice(-8).map(message => message.id)).toEqual([
    'viaje-palabras-revelation',
    'viaje-palabras-route-question',
    'viaje-palabras-route-action',
    'viaje-palabras-route',
    'viaje-palabras-teaching',
    'mestre-7',
    'student-8',
    'porta-musica-mestre',
  ]);
  expect(messages.at(-2)).toMatchObject({
    role: 'player', action: "EXPLICA-M'HO", text: 'Vull aprendre el truc.',
  });
});

test('R15: un error text-choice projecta resposta i feedback sense avançar', () => {
  let progress = { ...initialProgress(mixedJourneyLesson), started: true };
  for (const id of ['n1-a', 'n2-a', 'n3-a', 'n4-a', 'n5-a', 'n6-a', 'pintar'])
    progress = submitChallengeAnswer(mixedJourneyLesson, progress, id);
  const messages = messagesFor(mixedJourneyLesson, progress);
  expect(messages.slice(-2).map(message => message.text)).toEqual(['PINTAR', 'Busca el significat.']);
  expect(progress.completed).toEqual(['viaje-palabras']);
});
