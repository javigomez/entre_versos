import { lessonSchema, type Lesson } from '../../../domain/schemas';
import { createChallengeImageResolver, validateContentImages, type ChallengeImageResolver } from './content-images';
import type { ContentRepository } from '../../../application/content-repository';
import raw from './training.yaml';

export function createYamlContentRepository(): ContentRepository {
  return createValidatedYamlContentRepository(raw, createChallengeImageResolver());
}
export function createValidatedYamlContentRepository(rawContent: unknown, resolveImage: ChallengeImageResolver): ContentRepository {
  return { load: (): Lesson => { const lesson = lessonSchema.parse(rawContent); validateContentImages(lesson, resolveImage); return lesson; } };
}
