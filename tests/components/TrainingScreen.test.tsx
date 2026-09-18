import { afterEach, expect, jest, test } from '@jest/globals';
import { cleanup, render, screen, waitFor } from '@testing-library/react-native';
import { initialProgress, submitChallengeAnswer } from '../../src/domain/lesson';
import { TrainingScreen } from '../../src/infrastructure/expo/ui/TrainingScreen';
import { conversation } from '../fixtures/conversation';

afterEach(async () => {
  await cleanup();
  jest.restoreAllMocks();
});

test('carga contenido y progreso legacy una sola vez aunque la pantalla se vuelva a renderizar', async () => {
  const content = { load: jest.fn(() => conversation) };
  const progress = {
    load: jest.fn(async () => ({ sessionId: conversation.id, started: true, completed: [], history: [] })),
    save: jest.fn(async () => {}),
  };

  const view = await render(<TrainingScreen content={content} progress={progress} />);
  await waitFor(() => expect(progress.load).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('button', { name: 'Abundante' })).toBeOnTheScreen();

  await view.rerender(<TrainingScreen content={content} progress={progress} />);
  await waitFor(() => expect(content.load).toHaveBeenCalledTimes(1));
  expect(progress.load).toHaveBeenCalledTimes(1);
});

test('L04 / R02 / R09: carga progreso antiguo sin repetir el reto completado', async () => {
  const current = submitChallengeAnswer(conversation,
    { ...initialProgress(conversation), started: true }, 'a');
  const { lessonId, ...body } = current;
  const content = { load: jest.fn(() => conversation) };
  const progress = {
    load: jest.fn(async () => ({ sessionId: lessonId, ...body })),
    save: jest.fn(async () => {}),
  };

  await render(<TrainingScreen content={content} progress={progress} />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Agitado' })).toBeOnTheScreen());
  expect(screen.queryByRole('button', { name: 'Abundante' })).not.toBeOnTheScreen();
  expect(content.load).toHaveBeenCalledTimes(1);
  expect(progress.load).toHaveBeenCalledTimes(1);
});
