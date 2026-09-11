import { expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

test('el renderer de componentes funciona con el preset Expo', async () => {
  await render(<Text>Preparado</Text>);
  expect(screen.getByText('Preparado')).toBeOnTheScreen();
});
