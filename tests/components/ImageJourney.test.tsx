import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ImageJourney } from '../../src/infrastructure/expo/ui/ImageJourney';

const node = {
  id: 'l1-viaje', layer: 1, options: [
    { id: 'l1-viaje-nieve', text: 'NIEVE', image: { file: 'nieve.jpg', description: 'Sendero nevado' }, next: 'l2-nieve' },
    { id: 'l1-viaje-playa', text: 'PLAYA', image: { file: 'playa.jpg', description: 'Camino hacia el mar' }, next: 'l2-playa' },
  ],
};

test('presenta las dos fotografías en orden y bloquea la elección durante la transición', async () => {
  const onAnswer = jest.fn();
  const onSettled = jest.fn();
  const resolveImage = jest.fn(() => 1 as never);
  await render(<ImageJourney challengeId="viaje-palabras" node={node} locked={false} selectedOptionId="l1-viaje-playa" token={4}
    reducedMotion={false} resolveImage={resolveImage} onAnswer={onAnswer} onSettled={onSettled} />);

  expect(screen.getAllByRole('button').map(button => button.props.accessibilityLabel)).toEqual(['NIEVE', 'PLAYA']);
  fireEvent.press(screen.getByRole('button', { name: 'PLAYA' }));
  expect(onAnswer).toHaveBeenCalledWith('l1-viaje-playa', 'l1-viaje', 4);

  expect(screen.getByRole('button', { name: 'PLAYA' }).props.accessibilityState).toMatchObject({ disabled: false, selected: true });
});

test('J02/J04: bloquea el doble toque y resuelve sin fundido con movimiento reducido', async () => {
  jest.useFakeTimers();
  const onAnswer = jest.fn();
  const onSettled = jest.fn();
  await render(<ImageJourney challengeId="viaje-palabras" node={node} locked selectedOptionId="l1-viaje-nieve" token={7}
    reducedMotion resolveImage={() => 1 as never} onAnswer={onAnswer} onSettled={onSettled} />);

  const nieve = screen.getByRole('button', { name: 'NIEVE' });
  expect(nieve.props.accessibilityState).toMatchObject({ disabled: true, selected: true });
  fireEvent.press(nieve);
  expect(onAnswer).not.toHaveBeenCalled();
  await act(async () => { jest.runAllTimers(); });
  expect(onSettled).toHaveBeenCalledTimes(1);
  expect(onSettled).toHaveBeenCalledWith(7);
  jest.useRealTimers();
});
