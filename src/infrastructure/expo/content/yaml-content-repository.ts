import { lessonSchema } from '../../../domain/schemas';
import type { ContentRepository } from '../../../application/content-repository';
import raw from './training.yaml';

export function createYamlContentRepository(): ContentRepository {
  return { load: () => lessonSchema.parse(raw) };
}
