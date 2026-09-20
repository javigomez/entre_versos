import { expect, test } from '@jest/globals';
import { journey } from '../../tests/fixtures/journey';
import { journeyMessages } from './journey-messages';

const ids = ['n1-a', 'n2-a', 'n3-a', 'n4-a', 'n5-a', 'n6-a'];

test.each(['nadar', 'remar', 'volar', 'trepar'] as const)('J05: muestra el cierre real %s', ending => {
  const content = structuredClone(journey);
  content.nodes[5].options[0].ending = ending;
  content.nodes[5].options[0].text = ending.toUpperCase();
  const messages = journeyMessages(content, ids);
  expect(messages.map(message => message.id)).toEqual(['viaje-palabras-revelation', 'viaje-palabras-route', 'viaje-palabras-teaching']);
  expect(messages[0].text).toContain(ending.toUpperCase());
  expect(messages[1].text).toBe(`VIAJE → PASO1A → PASO2A → PASO3A → PASO4A → PASO5A → ${ending.toUpperCase()}`);
  expect(messages[2].text).toContain('no tienen que rimar');
});

test('J02: no crea mensajes hasta completar el sexto tap', () => {
  expect(journeyMessages(journey, ids.slice(0, 5))).toEqual([]);
  expect(journeyMessages(journey, ['n3-a'])).toEqual([]);
});
