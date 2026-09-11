import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { ChatMessage } from '../../src/infrastructure/expo/ui/ChatMessage';

beforeEach(() => { jest.useFakeTimers(); });
afterEach(async () => { await cleanup(); jest.clearAllTimers(); jest.useRealTimers(); });

test('R08: Mostrar completo y fin del reloj completan una sola vez', async () => {
  const onDone = jest.fn();
  await render(<ChatMessage message={{ id: 'm1', role: 'master', text: 'Verso completo.' }} animate reducedMotion={false} token={7} onDone={onDone} />);
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Mostrar mensaje completo' })); });
  await act(async () => { jest.advanceTimersByTime(1000); });
  expect(screen.getByText('Verso completo.')).toBeOnTheScreen();
  expect(onDone).toHaveBeenCalledTimes(1);
  expect(onDone).toHaveBeenCalledWith('m1', 7);
});

test('movimiento reducido muestra el texto y notifica una vez', async () => {
  const onDone = jest.fn();
  await render(<ChatMessage message={{ id: 'm2', role: 'player', text: 'Respuesta.' }} animate reducedMotion token={3} onDone={onDone} />);
  await act(async () => { jest.advanceTimersByTime(0); });
  expect(screen.getByText('Respuesta.')).toBeOnTheScreen();
  expect(onDone).toHaveBeenCalledWith('m2', 3);
});

test('desmontar cancela el temporizador', async () => {
  const onDone = jest.fn();
  const view = await render(<ChatMessage message={{ id: 'm3', role: 'master', text: 'Texto largo.' }} animate reducedMotion={false} token={1} onDone={onDone} />);
  await view.unmount();
  await act(async () => { jest.advanceTimersByTime(1000); });
  expect(onDone).not.toHaveBeenCalled();
});
