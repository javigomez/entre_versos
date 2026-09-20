import { lessonSchema } from '../../../domain/schemas';
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
  return { load: () => lessonSchema.parse(rawByKey[key]) };
}
