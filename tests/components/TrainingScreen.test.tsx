import { afterEach, expect, jest, test } from '@jest/globals';
import { cleanup, render, waitFor } from '@testing-library/react-native';
import { TrainingScreen } from '../../src/infrastructure/expo/ui/TrainingScreen';
import { initialProgress } from '../../src/domain/session';
import { conversation } from '../fixtures/conversation';

afterEach(async () => {
  await cleanup();
  jest.restoreAllMocks();
});

test('carga contenido y progreso una sola vez aunque la pantalla se vuelva a renderizar', async () => {
  const content = { load: jest.fn(() => conversation) };
  const progress = {
    load: jest.fn(async () => initialProgress(conversation)),
    save: jest.fn(async () => {}),
  };

  const view = await render(<TrainingScreen content={content} progress={progress} />);
  await waitFor(() => expect(progress.load).toHaveBeenCalledTimes(1));

  await view.rerender(<TrainingScreen content={content} progress={progress} />);
  await waitFor(() => expect(content.load).toHaveBeenCalledTimes(1));
  expect(progress.load).toHaveBeenCalledTimes(1);
});
