import { expect, test } from '@jest/globals';
import { sessionSchema } from './schemas';
import { conversation } from '../../tests/fixtures/conversation';

const script = conversation.script as unknown[];
const first = script.find((item): item is Record<string, unknown> => (item as { type: string }).type === 'single-choice')!;
const firstOptions = first.options as unknown[];

test('rechaza respuesta inexistente, IDs repetidos y opciones incompletas', () => {
  for (const patch of [
    { correctOptionId: 'no-existe' },
    { options: firstOptions.slice(1) },
    { options: Array(4).fill(firstOptions[0]) },
  ]) {
    const patchedScript = script.map((item: unknown) => item === first ? { ...first, ...patch } : item);
    const result = sessionSchema.safeParse({ ...conversation, script: patchedScript as typeof conversation.script });
    expect(result.success).toBe(false);
  }
  const duplicateResult = sessionSchema.safeParse({ ...conversation, script: [...script, first] as typeof conversation.script });
  expect(duplicateResult.success).toBe(false);
});
