import { lessonSchema, type Lesson } from '../../../domain/schemas';
import { createChallengeImageResolver, validateContentImages, type ChallengeImageResolver } from './content-images';
import type { ContentRepository } from '../../../application/content-repository';
import { campoSemanticoJourney } from './campo-semantico-journey';
import trainingRaw from './training.yaml';
import campSemanticRaw from './camp-semantic.yaml';
import type { ContentKey } from './content-selection';

const rawByKey = {
  training: trainingRaw,
  campo_semantico: campoSemanticoJourney,
  'camp-semantic': campSemanticRaw,
} as const;

/** Carga contenido editorial desde su fuente registrada, YAML o TypeScript. */
export function createContentRepository(key: ContentKey = 'training'): ContentRepository {
  if (!(key in rawByKey)) throw new Error(`Contenido no registrado: ${key}`);
  return createValidatedContentRepository(rawByKey[key], createChallengeImageResolver(key));
}

export function createValidatedContentRepository(rawContent: unknown, resolveImage: ChallengeImageResolver): ContentRepository {
  return { load: (): Lesson => { const lesson = lessonSchema.parse(rawContent); validateContentImages(lesson, resolveImage); return lesson; } };
}
