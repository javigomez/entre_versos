import { expect, test } from '@jest/globals';
import { createContentImageResolver, validateContentImages } from '../../src/infrastructure/expo/content/content-images';
import { lessonSchema, type Lesson } from '../../src/domain/schemas';
import { createContentRepository } from '../../src/infrastructure/expo/content/content-repository';
import { challengesOf } from '../../src/domain/lesson';
const lesson: Lesson = lessonSchema.parse({ id: 'demo', startAction: 'Empezar', script: [{ type: 'image-choice', id: 'viaje', mestre: 'M', prompt: 'P', options: [{ id: 'a', text: 'A', image: { file: 'a.jpg', description: 'A' } }, { id: 'b', text: 'B', image: { file: 'b.jpg', description: 'B' } }] }], completionLabel: 'Lección completada', completionTitle: 'Fin.', completionSummary: '{COUNT} retos.', restartAction: 'Volver', completion: 'Fin' });
test('resolver uses exact content/challenge/file keys and validates both options', () => {
  const resolver = createContentImageResolver({ demo: { viaje: { 'a.jpg': 1, 'b.jpg': 2 } } as never });
  validateContentImages(lesson, (id, file) => resolver('demo', id, file));
  expect(() => resolver('demo', 'viaje', 'missing.jpg')).toThrow('demo/viaje/missing.jpg');
});

test('campo semántico registra una imagen estática para cada una de las 80 decisiones', () => {
  const journey = challengesOf(createContentRepository('campo_semantico').load())
    .find(challenge => challenge.type === 'image-journey');
  expect(journey?.type).toBe('image-journey');
  if (!journey || journey.type !== 'image-journey') return;
  expect(journey.nodes.flatMap(node => node.options)).toHaveLength(80);
});
