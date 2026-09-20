import { expect, test, afterEach } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import App from '../../src/infrastructure/expo/App';

const originalLocation = globalThis.location;
const originalPlatformOs = Platform.OS;

afterEach(() => {
  Object.defineProperty(globalThis, 'location', { configurable: true, value: originalLocation });
  Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatformOs });
});

test('App selecciona el contenido indicado por la query web', async () => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  Object.defineProperty(globalThis, 'location', { configurable: true, value: { search: '?campo_semantico' } });
  await render(<App />);
  expect(await screen.findByRole('button', { name: 'LEVANTARME' })).toBeTruthy();
});

test('App muestra el error controlado para una query no registrada', async () => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  Object.defineProperty(globalThis, 'location', { configurable: true, value: { search: '?no-existe' } });
  await render(<App />);
  expect(await screen.findByText(/No se ha podido abrir el entrenamiento/i)).toBeTruthy();
});
