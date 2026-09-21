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

test('R13: la burbuja del jugador reserva su tamaño antes de escribir', async () => {
  const onDone = jest.fn();
  await render(<ChatMessage message={{ id: 'm4', role: 'player', text: 'Respuesta larga para comprobar el tamaño.' }} animate reducedMotion={false} token={4} onDone={onDone} />);

  expect(screen.getByTestId('typing-reserve')).toHaveTextContent('Respuesta larga para comprobar el tamaño.');
  expect(screen.getByText('▍')).toBeOnTheScreen();
  expect(screen.getByTestId('typing-content').props.style).toEqual(expect.arrayContaining([expect.objectContaining({ fontWeight: '400' })]));
});

test('R14: la escritura espera la cadencia general antes del primer tramo', async () => {
  const onDone = jest.fn();
  await render(<ChatMessage message={{ id: 'm5', role: 'master', text: 'Texto largo.' }} animate reducedMotion={false} token={5} onDone={onDone} />);

  await act(async () => { jest.advanceTimersByTime(29); });
  expect(screen.queryByText(/Tex/)).not.toBeOnTheScreen();

  await act(async () => { jest.advanceTimersByTime(1); });
  expect(screen.getByText(/Tex/)).toBeOnTheScreen();
});

test('verso usa escalado del sistema y peso regular', async () => {
  await render(<ChatMessage
    message={{ id: 'verse-1', role: 'master', kind: 'verse', text: 'línea corta\nla línea más larga del cuarteto\notra línea\núltima línea' }}
    animate={false}
    reducedMotion={false}
    token={1}
    onDone={jest.fn()}
  />);

  const text = screen.getByTestId('verse-text');
  expect(text.props.allowFontScaling).toBe(true);
  expect(text.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ fontWeight: '400' })]));
});

test('verso reduce el tamaño solo hasta que caben sus líneas explícitas', async () => {
  await render(<ChatMessage
    message={{ id: 'verse-2', role: 'master', kind: 'verse', text: 'línea corta\nla línea más larga del cuarteto' }}
    animate={false}
    reducedMotion={false}
    token={1}
    onDone={jest.fn()}
  />);

  const container = screen.getByTestId('verse-container');
  const text = screen.getByTestId('verse-text');
  await act(async () => { fireEvent(container, 'layout', { nativeEvent: { layout: { width: 200 } } }); });
  await act(async () => { fireEvent(screen.getByTestId('verse-text'), 'textLayout', { nativeEvent: { lines: [
    { text: 'línea corta', width: 120 },
    { text: 'la línea más', width: 195 },
    { text: 'larga del cuarteto', width: 170 },
  ] } }); });

  expect(text.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ fontSize: 16 })]));
});

test('reserva y contenido del jugador comparten la tipografía del verso', async () => {
  await render(<ChatMessage
    message={{ id: 'verse-3', role: 'player', kind: 'verse', text: 'siete sílabas aquí\ny otra línea más larga' }}
    animate
    reducedMotion={false}
    token={2}
    onDone={jest.fn()}
  />);

  const reserve = screen.getByTestId('typing-reserve');
  const content = screen.getByTestId('typing-content');
  expect(reserve.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ fontWeight: '400' })]));
  expect(content.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ fontWeight: '400' })]));
});

test('mensajes que no son versos no desactivan el escalado del sistema', async () => {
  await render(<ChatMessage
    message={{ id: 'plain-1', role: 'master', text: 'Texto normal.' }}
    animate={false}
    reducedMotion={false}
    token={1}
    onDone={jest.fn()}
  />);

  expect(screen.getByText('Texto normal.').props.allowFontScaling).toBeUndefined();
});
