import { expect, test } from '@jest/globals';
import { createContentImageResolver, validateContentImages } from '../../src/infrastructure/expo/content/content-images';
import { lessonSchema, type Lesson } from '../../src/domain/schemas';
const lesson: Lesson = lessonSchema.parse({ id: 'demo', startAction: 'Empezar', script: [{ type: 'image-choice', id: 'viaje', master: 'M', prompt: 'P', options: [{ id: 'a', text: 'A', image: { file: 'a.jpg', description: 'A' } }, { id: 'b', text: 'B', image: { file: 'b.jpg', description: 'B' } }] }], completion: 'Fin' });
test('resolver uses exact content/challenge/file keys and validates both options', () => {
  const resolver = createContentImageResolver({ demo: { viaje: { 'a.jpg': 1, 'b.jpg': 2 } } as never });
  validateContentImages(lesson, (id, file) => resolver('demo', id, file));
  expect(() => resolver('demo', 'viaje', 'missing.jpg')).toThrow('demo/viaje/missing.jpg');
});
