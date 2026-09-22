import { afterEach, expect, jest, test } from '@jest/globals';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import type { TextChoiceChallenge } from '../../src/domain/schemas';
import { TextChoiceChallengeView } from '../../src/infrastructure/expo/ui/TextChoiceChallenge';
import type { ControlTarget } from '../../src/infrastructure/expo/ui/viewport/useConversationViewport';

afterEach(cleanup);

const challenge: TextChoiceChallenge = {
  type: 'text-choice', id: 'porta-musica', master: 'MÚSICA necessita una porta.',
  prompt: 'MÚSICA → ?',
  options: [
    { id: 'cantar', text: 'CANTAR' },
    { id: 'pintar', text: 'PINTAR' },
    { id: 'nedar', text: 'NEDAR' },
    { id: 'tancar', text: 'TANCAR' },
  ],
  correctOptionId: 'cantar', success: 'CANTAR.', retry: 'Busca el significat.',
};

test('R15: mostra quatre files sense emoji i envia una sola resposta', async () => {
  const onAnswer = jest.fn<(id: string, target: ControlTarget) => void>();
  await render(<TextChoiceChallengeView challenge={challenge} onAnswer={onAnswer} />);
  expect(screen.getAllByRole('button')).toHaveLength(4);
  expect(screen.queryByText('🌊')).not.toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: 'CANTAR' }));
  expect(onAnswer).toHaveBeenCalledTimes(1);
  expect(onAnswer).toHaveBeenCalledWith('cantar', expect.objectContaining({ id: 'cantar' }));
  const target = onAnswer.mock.calls[0]?.[1];
  expect(target.renderPreview()).toBeTruthy();
});

test('R16: la fila no fixa alçada ni trunca una opció llarga', async () => {
  const text = 'MÚSICA dins; CANTAR tanca el vers amb força';
  await render(<TextChoiceChallengeView challenge={{ ...challenge, options: [
    { id: 'pont', text }, { id: 'final', text: 'MÚSICA al final' },
  ] }} onAnswer={jest.fn()} />);
  const label = screen.getByText(text);
  expect(label.props.numberOfLines).toBeUndefined();
  expect(label.props.ellipsizeMode).toBeUndefined();
  const button = screen.getByRole('button', { name: text });
  const rawStyle = typeof button.props.style === 'function'
    ? button.props.style({ pressed: false }) : button.props.style;
  const style = StyleSheet.flatten(rawStyle);
  expect(style.height).toBeUndefined();
  expect(style.minHeight).toBe(52);
});

test('R15: bloqueja la selecció, conserva l’estat accessible i no respon', async () => {
  const onAnswer = jest.fn();
  await render(<TextChoiceChallengeView challenge={challenge} onAnswer={onAnswer}
    disabled selectedOptionId="cantar" />);
  const selected = screen.getByRole('button', { name: 'CANTAR' });
  expect(selected).toBeDisabled();
  expect(selected.props.accessibilityState).toEqual({ disabled: true, selected: true });
  fireEvent.press(selected);
  expect(onAnswer).not.toHaveBeenCalled();
});
