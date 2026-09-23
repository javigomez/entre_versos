import { fireEvent, render, screen } from '@testing-library/react-native';
import { ImageChoiceChallenge } from '../../src/infrastructure/expo/ui/ImageChoiceChallenge';
const challenge = { type: 'image-choice' as const, id: 'viaje', mestre: 'M', prompt: '¿Por dónde?', options: [
  { id: 'nieve', text: 'NIEVE', image: { file: 'nieve.jpg', description: 'Sendero nevado' } },
  { id: 'playa', text: 'PLAYA', image: { file: 'playa.jpg', description: 'Camino al mar' } },
] };
test('renders two accessible image options in content order and selects one', async () => {
  const onAnswer = jest.fn();
  const resolver = jest.fn(() => 1 as never);
  await render(<ImageChoiceChallenge challenge={challenge} resolveImage={resolver} onAnswer={onAnswer} />);
  expect(screen.getAllByRole('button').map(button => button.props.accessibilityLabel)).toEqual(['NIEVE', 'PLAYA']);
  fireEvent.press(screen.getByRole('button', { name: 'NIEVE' }));
  expect(onAnswer.mock.calls[0][0]).toBe('nieve');
  expect(resolver).toHaveBeenCalledWith('viaje', 'nieve.jpg');
});
