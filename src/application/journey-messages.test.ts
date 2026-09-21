import { expect, test } from '@jest/globals';
import { journey } from '../../tests/fixtures/journey';
import { journeyMessages } from './journey-messages';

const ids = ['n1-a', 'n2-a', 'n3-a', 'n4-a', 'n5-a', 'n6-a'];

test.each(['nadar', 'remar', 'volar', 'trepar'] as const)('J05: muestra el cierre real %s', ending => {
  const content = structuredClone(journey);
  content.nodes[5].options[0].ending = ending;
  content.nodes[5].options[0].text = ending.toUpperCase();
  const messages = journeyMessages(content, ids);
  const closing = messages.slice(-3);
  expect(closing.map(message => message.id)).toEqual(['viaje-palabras-revelation', 'viaje-palabras-route', 'viaje-palabras-teaching']);
  expect(closing[0].text).toContain(ending.toUpperCase());
  expect(closing[1].text).toBe(`VIAJE → PASO1A → PASO2A → PASO3A → PASO4A → PASO5A → ${ending.toUpperCase()}`);
  expect(closing[2].text).toContain('no tienen que rimar');
});

test('J01: cada elección se proyecta como una palabra del jugador antes del cierre', () => {
  expect(journeyMessages(journey, ids.slice(0, 2)).map(message => ({ id: message.id, text: message.text })))
    .toEqual([
      { id: 'viaje-palabras-answer-0', text: 'PASO1A' },
      { id: 'viaje-palabras-answer-1', text: 'PASO2A' },
    ]);
  expect(journeyMessages(journey, ids.slice(0, 3)).map(message => message.text)).toEqual(['PASO1A', 'PASO2A', 'PASO3A']);
});
