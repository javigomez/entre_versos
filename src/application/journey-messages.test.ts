import { expect, test } from '@jest/globals';
import { journey } from '../../tests/fixtures/journey';
import { journeyMessages } from './journey-messages';

const ids = ['n1-a', 'n2-a', 'n3-a', 'n4-a', 'n5-a', 'n6-a'];

test.each(['nadar', 'remar', 'volar', 'trepar'] as const)('J07: pide ver el recorrido antes de mostrar el cierre %s', ending => {
  const content = structuredClone(journey);
  content.nodes[5].options[0].ending = ending;
  content.nodes[5].options[0].text = ending.toUpperCase();
  const messages = journeyMessages(content, ids);
  const closing = messages.slice(-5);
  expect(closing.map(message => message.id)).toEqual(['viaje-palabras-revelation', 'viaje-palabras-route-question', 'viaje-palabras-route-action', 'viaje-palabras-route', 'viaje-palabras-teaching']);
  expect(closing[0].text).toContain(ending);
  expect(closing[1]).toMatchObject({ role: 'master', text: '¿Quieres ver el recorrido que has trazado?' });
  expect(closing[2]).toMatchObject({ role: 'player', action: 'VER MI RECORRIDO', text: 'Quiero ver el recorrido que he hecho.' });
  expect(closing[3]).toMatchObject({ role: 'master', label: 'Tu recorrido', text: `Viaje → Paso1a → Paso2a → Paso3a → Paso4a → Paso5a → ${ending[0].toUpperCase()}${ending.slice(1)}` });
  expect(closing[4].text).toContain('no tienen que rimar');
});

test('J01: cada elección se proyecta como una palabra del jugador antes del cierre', () => {
  expect(journeyMessages(journey, ids.slice(0, 2)).map(message => ({ id: message.id, text: message.text })))
    .toEqual([
      { id: 'viaje-palabras-answer-0', text: 'Paso1a' },
      { id: 'viaje-palabras-answer-1', text: 'Paso2a' },
    ]);
  expect(journeyMessages(journey, ids.slice(0, 3)).map(message => message.text)).toEqual(['Paso1a', 'Paso2a', 'Paso3a']);
});
