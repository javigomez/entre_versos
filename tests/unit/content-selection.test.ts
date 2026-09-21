import { expect, test } from '@jest/globals';
import { contentKeyFromSearch } from '../../src/infrastructure/expo/content/content-selection';

test.each([
  ['', 'training'],
  ['?', 'training'],
  ['?training', 'training'],
  ['?campo_semantico', 'campo_semantico'],
  ['?content=campo_semantico', 'campo_semantico'],
  ['?camp-semantic', 'camp-semantic'],
  ['?content=camp-semantic', 'camp-semantic'],
])('selecciona %s como %s', (search, expected) => {
  expect(contentKeyFromSearch(search)).toBe(expected);
});

test.each(['?training.yaml', '?../training', '?campo%20semantico', '?training=', '?training=otro', '?training&campo_semantico', '?desconocido'])
  ('rechaza la query no segura %s', search => {
    expect(() => contentKeyFromSearch(search)).toThrow(/contenido/i);
  });
