import type { ImageSourcePropType } from 'react-native';
import type { Lesson } from '../../../domain/schemas';
import { challengesOf } from '../../../domain/lesson';

export type ContentImageRegistry = Readonly<Record<string, Readonly<Record<string, Readonly<Record<string, ImageSourcePropType>>>>>>;
export type ChallengeImageResolver = (challengeId: string, file: string) => ImageSourcePropType;

export const contentImageRegistry: ContentImageRegistry = {
  training: {
    'viaje-inicial': {
      'nieve.jpg': require('./training/viaje-inicial/images/nieve.jpg'),
      'playa.jpg': require('./training/viaje-inicial/images/playa.jpg'),
    },
  },
  campo_semantico: {
    'viaje-palabras': {
    'l1-viaje-nieve.jpg': require('./campo_semantico/viaje-palabras/images/l1-viaje-nieve.jpg'),
    'l1-viaje-playa.jpg': require('./campo_semantico/viaje-palabras/images/l1-viaje-playa.jpg'),
    'l2-nieve-refugio.jpg': require('./campo_semantico/viaje-palabras/images/l2-nieve-refugio.jpg'),
    'l2-nieve-hielo.jpg': require('./campo_semantico/viaje-palabras/images/l2-nieve-hielo.jpg'),
    'l2-playa-mar.jpg': require('./campo_semantico/viaje-palabras/images/l2-playa-mar.jpg'),
    'l2-playa-arena.jpg': require('./campo_semantico/viaje-palabras/images/l2-playa-arena.jpg'),
    'l3-refugio-ventana.jpg': require('./campo_semantico/viaje-palabras/images/l3-refugio-ventana.jpg'),
    'l3-refugio-fuego.jpg': require('./campo_semantico/viaje-palabras/images/l3-refugio-fuego.jpg'),
    'l3-hielo-lago.jpg': require('./campo_semantico/viaje-palabras/images/l3-hielo-lago.jpg'),
    'l3-hielo-cumbre.jpg': require('./campo_semantico/viaje-palabras/images/l3-hielo-cumbre.jpg'),
    'l3-mar-barca.jpg': require('./campo_semantico/viaje-palabras/images/l3-mar-barca.jpg'),
    'l3-mar-oleaje.jpg': require('./campo_semantico/viaje-palabras/images/l3-mar-oleaje.jpg'),
    'l3-arena-dunas.jpg': require('./campo_semantico/viaje-palabras/images/l3-arena-dunas.jpg'),
    'l3-arena-acantilado.jpg': require('./campo_semantico/viaje-palabras/images/l3-arena-acantilado.jpg'),
    'l4-ventana-huellas.jpg': require('./campo_semantico/viaje-palabras/images/l4-ventana-huellas.jpg'),
    'l4-ventana-bosque.jpg': require('./campo_semantico/viaje-palabras/images/l4-ventana-bosque.jpg'),
    'l4-fuego-humo.jpg': require('./campo_semantico/viaje-palabras/images/l4-fuego-humo.jpg'),
    'l4-fuego-chispas.jpg': require('./campo_semantico/viaje-palabras/images/l4-fuego-chispas.jpg'),
    'l4-lago-orilla.jpg': require('./campo_semantico/viaje-palabras/images/l4-lago-orilla.jpg'),
    'l4-lago-isla.jpg': require('./campo_semantico/viaje-palabras/images/l4-lago-isla.jpg'),
    'l4-cumbre-cielo.jpg': require('./campo_semantico/viaje-palabras/images/l4-cumbre-cielo.jpg'),
    'l4-cumbre-roca.jpg': require('./campo_semantico/viaje-palabras/images/l4-cumbre-roca.jpg'),
    'l4-barca-remos.jpg': require('./campo_semantico/viaje-palabras/images/l4-barca-remos.jpg'),
    'l4-barca-horizonte.jpg': require('./campo_semantico/viaje-palabras/images/l4-barca-horizonte.jpg'),
    'l4-oleaje-espuma.jpg': require('./campo_semantico/viaje-palabras/images/l4-oleaje-espuma.jpg'),
    'l4-oleaje-corriente.jpg': require('./campo_semantico/viaje-palabras/images/l4-oleaje-corriente.jpg'),
    'l4-dunas-viento.jpg': require('./campo_semantico/viaje-palabras/images/l4-dunas-viento.jpg'),
    'l4-dunas-altura.jpg': require('./campo_semantico/viaje-palabras/images/l4-dunas-altura.jpg'),
    'l4-acantilado-vacio.jpg': require('./campo_semantico/viaje-palabras/images/l4-acantilado-vacio.jpg'),
    'l4-acantilado-pared.jpg': require('./campo_semantico/viaje-palabras/images/l4-acantilado-pared.jpg'),
    'l5-huellas-rio.jpg': require('./campo_semantico/viaje-palabras/images/l5-huellas-rio.jpg'),
    'l5-huellas-montana.jpg': require('./campo_semantico/viaje-palabras/images/l5-huellas-montana.jpg'),
    'l5-bosque-rio.jpg': require('./campo_semantico/viaje-palabras/images/l5-bosque-rio.jpg'),
    'l5-bosque-montana.jpg': require('./campo_semantico/viaje-palabras/images/l5-bosque-montana.jpg'),
    'l5-humo-cielo.jpg': require('./campo_semantico/viaje-palabras/images/l5-humo-cielo.jpg'),
    'l5-humo-montana.jpg': require('./campo_semantico/viaje-palabras/images/l5-humo-montana.jpg'),
    'l5-chispas-cielo.jpg': require('./campo_semantico/viaje-palabras/images/l5-chispas-cielo.jpg'),
    'l5-chispas-montana.jpg': require('./campo_semantico/viaje-palabras/images/l5-chispas-montana.jpg'),
    'l5-orilla-agua.jpg': require('./campo_semantico/viaje-palabras/images/l5-orilla-agua.jpg'),
    'l5-orilla-barca.jpg': require('./campo_semantico/viaje-palabras/images/l5-orilla-barca.jpg'),
    'l5-isla-agua.jpg': require('./campo_semantico/viaje-palabras/images/l5-isla-agua.jpg'),
    'l5-isla-roca.jpg': require('./campo_semantico/viaje-palabras/images/l5-isla-roca.jpg'),
    'l5-cielo-aire.jpg': require('./campo_semantico/viaje-palabras/images/l5-cielo-aire.jpg'),
    'l5-cielo-roca.jpg': require('./campo_semantico/viaje-palabras/images/l5-cielo-roca.jpg'),
    'l5-roca-altura.jpg': require('./campo_semantico/viaje-palabras/images/l5-roca-altura.jpg'),
    'l5-roca-pared.jpg': require('./campo_semantico/viaje-palabras/images/l5-roca-pared.jpg'),
    'l5-remos-barca.jpg': require('./campo_semantico/viaje-palabras/images/l5-remos-barca.jpg'),
    'l5-remos-agua.jpg': require('./campo_semantico/viaje-palabras/images/l5-remos-agua.jpg'),
    'l5-horizonte-aire.jpg': require('./campo_semantico/viaje-palabras/images/l5-horizonte-aire.jpg'),
    'l5-horizonte-agua.jpg': require('./campo_semantico/viaje-palabras/images/l5-horizonte-agua.jpg'),
    'l5-espuma-agua.jpg': require('./campo_semantico/viaje-palabras/images/l5-espuma-agua.jpg'),
    'l5-espuma-barca.jpg': require('./campo_semantico/viaje-palabras/images/l5-espuma-barca.jpg'),
    'l5-corriente-agua.jpg': require('./campo_semantico/viaje-palabras/images/l5-corriente-agua.jpg'),
    'l5-corriente-barca.jpg': require('./campo_semantico/viaje-palabras/images/l5-corriente-barca.jpg'),
    'l5-viento-aire.jpg': require('./campo_semantico/viaje-palabras/images/l5-viento-aire.jpg'),
    'l5-viento-altura.jpg': require('./campo_semantico/viaje-palabras/images/l5-viento-altura.jpg'),
    'l5-altura-aire.jpg': require('./campo_semantico/viaje-palabras/images/l5-altura-aire.jpg'),
    'l5-altura-pared.jpg': require('./campo_semantico/viaje-palabras/images/l5-altura-pared.jpg'),
    'l5-vacio-aire.jpg': require('./campo_semantico/viaje-palabras/images/l5-vacio-aire.jpg'),
    'l5-vacio-pared.jpg': require('./campo_semantico/viaje-palabras/images/l5-vacio-pared.jpg'),
    'l5-pared-altura.jpg': require('./campo_semantico/viaje-palabras/images/l5-pared-altura.jpg'),
    'l5-pared-roca.jpg': require('./campo_semantico/viaje-palabras/images/l5-pared-roca.jpg'),
    'l6-rio-nadar.jpg': require('./campo_semantico/viaje-palabras/images/l6-rio-nadar.jpg'),
    'l6-rio-remar.jpg': require('./campo_semantico/viaje-palabras/images/l6-rio-remar.jpg'),
    'l6-montana-trepar.jpg': require('./campo_semantico/viaje-palabras/images/l6-montana-trepar.jpg'),
    'l6-montana-volar.jpg': require('./campo_semantico/viaje-palabras/images/l6-montana-volar.jpg'),
    'l6-cielo-volar.jpg': require('./campo_semantico/viaje-palabras/images/l6-cielo-volar.jpg'),
    'l6-cielo-trepar.jpg': require('./campo_semantico/viaje-palabras/images/l6-cielo-trepar.jpg'),
    'l6-agua-nadar.jpg': require('./campo_semantico/viaje-palabras/images/l6-agua-nadar.jpg'),
    'l6-agua-remar.jpg': require('./campo_semantico/viaje-palabras/images/l6-agua-remar.jpg'),
    'l6-barca-remar.jpg': require('./campo_semantico/viaje-palabras/images/l6-barca-remar.jpg'),
    'l6-barca-nadar.jpg': require('./campo_semantico/viaje-palabras/images/l6-barca-nadar.jpg'),
    'l6-aire-volar.jpg': require('./campo_semantico/viaje-palabras/images/l6-aire-volar.jpg'),
    'l6-aire-trepar.jpg': require('./campo_semantico/viaje-palabras/images/l6-aire-trepar.jpg'),
    'l6-altura-volar.jpg': require('./campo_semantico/viaje-palabras/images/l6-altura-volar.jpg'),
    'l6-altura-trepar.jpg': require('./campo_semantico/viaje-palabras/images/l6-altura-trepar.jpg'),
    'l6-pared-trepar.jpg': require('./campo_semantico/viaje-palabras/images/l6-pared-trepar.jpg'),
    'l6-pared-volar.jpg': require('./campo_semantico/viaje-palabras/images/l6-pared-volar.jpg'),
    'l6-roca-trepar.jpg': require('./campo_semantico/viaje-palabras/images/l6-roca-trepar.jpg'),
    'l6-roca-volar.jpg': require('./campo_semantico/viaje-palabras/images/l6-roca-volar.jpg'),
    },
  },
};

export function createContentImageResolver(registry: ContentImageRegistry) {
  return (contentKey: string, challengeId: string, file: string): ImageSourcePropType => {
    const image = registry[contentKey]?.[challengeId]?.[file];
    if (!image) throw new Error(`Imatge no registrada: ${contentKey}/${challengeId}/${file}`);
    return image;
  };
}

export const resolveContentImage = createContentImageResolver(contentImageRegistry);

export function createChallengeImageResolver(contentKey = 'training'): ChallengeImageResolver {
  const imageKey = ['camp-semantic', 'camp-semantic-v2', 'camp-semantic-v3', 'camp-semantic-v4'].includes(contentKey) ? 'campo_semantico' : contentKey;
  return (challengeId, file) => resolveContentImage(imageKey, challengeId, file);
}

export function validateContentImages(lesson: Lesson, resolveImage: ChallengeImageResolver): void {
  for (const challenge of challengesOf(lesson)) {
    if (challenge.type === 'image-choice') for (const option of challenge.options) resolveImage(challenge.id, option.image.file);
    if (challenge.type === 'image-journey') for (const node of challenge.nodes) for (const option of node.options) resolveImage(challenge.id, option.image.file);
  }
}
