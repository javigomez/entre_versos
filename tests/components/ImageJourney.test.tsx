import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ImageJourney } from '../../src/infrastructure/expo/ui/ImageJourney';

const node = {
  id: 'l1-viaje', layer: 1, options: [
    { id: 'l1-viaje-nieve', text: 'NIEVE', image: { file: 'nieve.jpg', description: 'Sendero nevado' }, next: 'l2-nieve' },
    { id: 'l1-viaje-playa', text: 'PLAYA', image: { file: 'playa.jpg', description: 'Camino hacia el mar' }, next: 'l2-playa' },
  ],
};

test('presenta las dos fotografías en el chat y entrega un control para la transición normal', async () => {
  const onAnswer = jest.fn();
  const resolveImage = jest.fn(() => 1 as never);
  await render(<ImageJourney challengeId="viaje-palabras" options={node.options} disabled={false} selectedOptionId="l1-viaje-playa"
    resolveImage={resolveImage} onAnswer={onAnswer} />);

  expect(screen.getAllByRole('button').map(button => button.props.accessibilityLabel)).toEqual(['NIEVE', 'PLAYA']);
  fireEvent.press(screen.getByRole('button', { name: 'PLAYA' }));
  expect(onAnswer).toHaveBeenCalledWith('l1-viaje-playa', expect.objectContaining({ id: 'l1-viaje-playa' }));

  expect(screen.getByRole('button', { name: 'PLAYA' }).props.accessibilityState).toMatchObject({ disabled: false, selected: true });
});

test('J02: bloquea el doble toque mientras la respuesta asciende', async () => {
  const onAnswer = jest.fn();
  await render(<ImageJourney challengeId="viaje-palabras" options={node.options} disabled selectedOptionId="l1-viaje-nieve"
    resolveImage={() => 1 as never} onAnswer={onAnswer} />);

  const nieve = screen.getByRole('button', { name: 'NIEVE' });
  expect(nieve.props.accessibilityState).toMatchObject({ disabled: true, selected: true });
  fireEvent.press(nieve);
  expect(onAnswer).not.toHaveBeenCalled();
});

test('J05: la tarjeta seleccionada usa un único borde visual', async () => {
  await render(<ImageJourney challengeId="viaje-palabras" options={node.options} selectedOptionId="l1-viaje-nieve"
    resolveImage={() => 1 as never} onAnswer={() => {}} />);

  const outerControl = screen.getByRole('button', { name: 'NIEVE' });
  expect(StyleSheet.flatten(outerControl.props.style)).not.toMatchObject({ borderWidth: 1 });
});
