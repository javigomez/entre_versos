import type { ImageSourcePropType } from 'react-native';
import type { Lesson } from '../../../domain/schemas';
import { challengesOf } from '../../../domain/lesson';

export type ContentImageRegistry = Readonly<Record<string, Readonly<Record<string, Readonly<Record<string, ImageSourcePropType>>>>>>;
export type ChallengeImageResolver = (challengeId: string, file: string) => ImageSourcePropType;
export const contentImageRegistry: ContentImageRegistry = {
  training: { 'viaje-inicial': { 'nieve.jpg': require('./training/viaje-inicial/images/nieve.jpg'), 'playa.jpg': require('./training/viaje-inicial/images/playa.jpg') } },
};
export function createContentImageResolver(registry: ContentImageRegistry) {
  return (contentKey: string, challengeId: string, file: string): ImageSourcePropType => {
    const image = registry[contentKey]?.[challengeId]?.[file];
    if (!image) throw new Error(`Imagen no registrada: ${contentKey}/${challengeId}/${file}`);
    return image;
  };
}
export const resolveContentImage = createContentImageResolver(contentImageRegistry);
export function createChallengeImageResolver(contentKey = 'training'): ChallengeImageResolver {
  return (challengeId, file) => resolveContentImage(contentKey, challengeId, file);
}
export function validateContentImages(lesson: Lesson, resolveImage: ChallengeImageResolver): void {
  for (const challenge of challengesOf(lesson)) if (challenge.type === 'image-choice') for (const option of challenge.options) resolveImage(challenge.id, option.image.file);
}
