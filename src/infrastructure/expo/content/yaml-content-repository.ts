import { lessonSchema, type Lesson } from '../../../domain/schemas';
import { createChallengeImageResolver, validateContentImages, type ChallengeImageResolver } from './content-images';
import type { ContentRepository } from '../../../application/content-repository';
import campoSemanticoRaw from './campo_semantico.yaml';
import trainingRaw from './training.yaml';
import type { ContentKey } from './content-selection';

const rawByKey = {
  training: trainingRaw,
  campo_semantico: campoSemanticoRaw,
} as const;

export function createYamlContentRepository(key: ContentKey = 'training'): ContentRepository {
  if (!(key in rawByKey)) throw new Error(`Contenido no registrado: ${key}`);
  return createValidatedYamlContentRepository(rawByKey[key], createChallengeImageResolver());
}

export function createValidatedYamlContentRepository(rawContent: unknown, resolveImage: ChallengeImageResolver): ContentRepository {
  return { load: (): Lesson => { const lesson = lessonSchema.parse(rawContent); validateContentImages(lesson, resolveImage); return lesson; } };
}
