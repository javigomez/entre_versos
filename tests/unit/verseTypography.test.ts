import { findLargestVerseFontSize } from '../../src/infrastructure/expo/ui/verseTypography';

test('uses the largest size that fits every line', () => {
  const size = findLargestVerseFontSize({
    lines: ['Ya no queda aquí tu gente,', 'ni el rival que te venció;'],
    availableWidth: 300,
    preferredSize: 25,
    minimumSize: 16,
    measureLine: (line, fontSize) => line.length * fontSize * 0.5,
  });

  expect(size).toBe(23);
});

test('the widest line controls the result', () => {
  const size = findLargestVerseFontSize({
    lines: ['corta', 'esta es la línea deliberadamente más larga'],
    availableWidth: 200,
    preferredSize: 25,
    minimumSize: 16,
    measureLine: (line, fontSize) => line.length * fontSize * 0.5,
  });

  expect(size).toBe(16);
});

test('never returns below the configured minimum', () => {
  const size = findLargestVerseFontSize({
    lines: ['una línea imposible de encajar'],
    availableWidth: 20,
    preferredSize: 25,
    minimumSize: 16,
    measureLine: () => 999,
  });

  expect(size).toBe(16);
});
