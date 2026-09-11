import { expect, test } from '@jest/globals';
import {
  anchorOffset, contentTopFromWindow, followingOffset, hasContentBelow,
  relativeLeftFromWindow, spacerHeight,
} from '../../src/infrastructure/expo/ui/viewport/scrollPolicy';

const base = {
  offset: 0, viewportHeight: 300, anchorTop: 150,
  topInset: 10, bottomInset: 0, following: true,
};

test.each([
  [250, null], [320, 20], [410, 110], [440, 140], [900, 140],
])('cursor en %s → destino %s', (cursorBottom: number, expected: number | null) => {
  expect(followingOffset({ ...base, cursorBottom })).toBe(expected);
});

test('no pelea con el lector ni retrocede al crecer texto', () => {
  expect(followingOffset({ ...base, offset: 140, cursorBottom: 900 })).toBeNull();
  expect(followingOffset({ ...base, offset: 200, cursorBottom: 900 })).toBeNull();
  expect(followingOffset({ ...base, cursorBottom: 900, following: false })).toBeNull();
});

test('convierte ventana a contenido y permite colocar al final', () => {
  expect(contentTopFromWindow(500, 100, 200)).toBe(600);
  expect(relativeLeftFromWindow(480, 325)).toBe(155);
  expect(anchorOffset(600, 10)).toBe(590);
  expect(anchorOffset(5, 10)).toBe(0);
  expect(spacerHeight(800, 500, 590)).toBe(290);
  expect(spacerHeight(1200, 500, 590)).toBe(0);
});

test('el espacio auxiliar no cuenta como texto pendiente', () => {
  expect(hasContentBelow(300, 0, 300)).toBe(false);
  expect(hasContentBelow(301, 0, 300)).toBe(true);
  expect(hasContentBelow(600, 310, 300)).toBe(false);
});

test('la secuencia conserva el ancla y deja de mover cuando ya llegó', () => {
  let offset = 0;
  const destinations = [250, 320, 410, 900].map(cursorBottom => {
    const destination = followingOffset({ ...base, offset, cursorBottom });
    if (destination !== null) offset = destination;
    return destination;
  });
  expect(destinations).toEqual([null, 20, 110, 140]);
  expect(followingOffset({ ...base, offset, cursorBottom: 1100 })).toBeNull();
});

test('respeta viewport cero, margen inferior y nueva ancla', () => {
  expect(followingOffset({ ...base, viewportHeight: 0, cursorBottom: 320 })).toBeNull();
  expect(followingOffset({ ...base, bottomInset: 20, cursorBottom: 320 })).toBe(40);
  expect(followingOffset({ ...base, anchorTop: 600, cursorBottom: 900 })).toBe(590);
  expect(followingOffset({ ...base, anchorTop: 600, cursorBottom: 1200 })).toBe(590);
});
