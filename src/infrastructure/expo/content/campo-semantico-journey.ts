import type { Lesson } from '../../../domain/schemas';

type Edge = readonly [word: string, next: string] | readonly [word: string, ending: 'nadar' | 'remar' | 'volar' | 'trepar'];
type Graph = Readonly<Record<string, readonly Edge[]>>;

const graph: Graph = {
  'l1-viaje': [['NIEVE', 'l2-nieve'], ['PLAYA', 'l2-playa']],
  'l2-nieve': [['REFUGIO', 'l3-refugio'], ['HIELO', 'l3-hielo']],
  'l2-playa': [['MAR', 'l3-mar'], ['ARENA', 'l3-arena']],
  'l3-refugio': [['VENTANA', 'l4-ventana'], ['FUEGO', 'l4-fuego']],
  'l3-hielo': [['LAGO', 'l4-lago'], ['CUMBRE', 'l4-cumbre']],
  'l3-mar': [['BARCA', 'l4-barca'], ['OLEAJE', 'l4-oleaje']],
  'l3-arena': [['DUNAS', 'l4-dunas'], ['ACANTILADO', 'l4-acantilado']],
  'l4-ventana': [['HUELLAS', 'l5-huellas'], ['BOSQUE', 'l5-bosque']],
  'l4-fuego': [['HUMO', 'l5-humo'], ['CHISPAS', 'l5-chispas']],
  'l4-lago': [['ORILLA', 'l5-orilla'], ['ISLA', 'l5-isla']],
  'l4-cumbre': [['CIELO', 'l5-cielo'], ['ROCA', 'l5-roca']],
  'l4-barca': [['REMOS', 'l5-remos'], ['HORIZONTE', 'l5-horizonte']],
  'l4-oleaje': [['ESPUMA', 'l5-espuma'], ['CORRIENTE', 'l5-corriente']],
  'l4-dunas': [['VIENTO', 'l5-viento'], ['ALTURA', 'l5-altura']],
  'l4-acantilado': [['VACÍO', 'l5-vacio'], ['PARED', 'l5-pared']],
  'l5-huellas': [['RÍO', 'l6-rio'], ['MONTAÑA', 'l6-montana']],
  'l5-bosque': [['RÍO', 'l6-rio'], ['MONTAÑA', 'l6-montana']],
  'l5-humo': [['CIELO', 'l6-cielo'], ['MONTAÑA', 'l6-montana']],
  'l5-chispas': [['CIELO', 'l6-cielo'], ['MONTAÑA', 'l6-montana']],
  'l5-orilla': [['AGUA', 'l6-agua'], ['BARCA', 'l6-barca']],
  'l5-isla': [['AGUA', 'l6-agua'], ['ROCA', 'l6-roca']],
  'l5-cielo': [['AIRE', 'l6-aire'], ['ROCA', 'l6-roca']],
  'l5-roca': [['ALTURA', 'l6-altura'], ['PARED', 'l6-pared']],
  'l5-remos': [['BARCA', 'l6-barca'], ['AGUA', 'l6-agua']],
  'l5-horizonte': [['AIRE', 'l6-aire'], ['AGUA', 'l6-agua']],
  'l5-espuma': [['AGUA', 'l6-agua'], ['BARCA', 'l6-barca']],
  'l5-corriente': [['AGUA', 'l6-agua'], ['BARCA', 'l6-barca']],
  'l5-viento': [['AIRE', 'l6-aire'], ['ALTURA', 'l6-altura']],
  'l5-altura': [['AIRE', 'l6-aire'], ['PARED', 'l6-pared']],
  'l5-vacio': [['AIRE', 'l6-aire'], ['PARED', 'l6-pared']],
  'l5-pared': [['ALTURA', 'l6-altura'], ['ROCA', 'l6-roca']],
  'l6-rio': [['NADAR', 'nadar'], ['REMAR', 'remar']],
  'l6-montana': [['TREPAR', 'trepar'], ['VOLAR', 'volar']],
  'l6-cielo': [['VOLAR', 'volar'], ['TREPAR', 'trepar']],
  'l6-agua': [['NADAR', 'nadar'], ['REMAR', 'remar']],
  'l6-barca': [['REMAR', 'remar'], ['NADAR', 'nadar']],
  'l6-aire': [['VOLAR', 'volar'], ['TREPAR', 'trepar']],
  'l6-altura': [['VOLAR', 'volar'], ['TREPAR', 'trepar']],
  'l6-pared': [['TREPAR', 'trepar'], ['VOLAR', 'volar']],
  'l6-roca': [['TREPAR', 'trepar'], ['VOLAR', 'volar']],
};

const wordId = (word: string) => word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const layerOf = (nodeId: string) => Number(nodeId.slice(1, nodeId.indexOf('-')));
const ending = (value: string): value is 'nadar' | 'remar' | 'volar' | 'trepar' => ['nadar', 'remar', 'volar', 'trepar'].includes(value);

export const campoSemanticoJourney: Lesson = {
  id: 'campo-semantico-viaje-v1', startAction: 'LEVANTARME', startWithStudent: true,
  script: [
    { type: 'mestre', label: 'Voz', text: 'Ya se ha marchado la gente,\nqueda el eco del rival;\nte levantas lentamente:\ntu silencio fue el final.' },
    { type: 'student', action: 'LEVANTARME', text: 'No me han dado ningún golpe. Me quedé sin palabras delante de todos.' },
    { type: 'mestre', label: 'Voz', text: 'Ya no queda aquí tu gente,\nni el rival que te venció;\npero ves, sorprendentemente,\nun papel que alguien dejó.' },
    { type: 'student', action: 'VER NOTA', text: 'Recojo el papel y leo: «Si quieres saber por qué has perdido, encuéntrame».' },
    { type: 'mestre', label: 'Nota', text: 'No busques una respuesta correcta. Elige lo que te sugiera cada imagen y sigue el viaje.' },
    { type: 'student', action: 'EMPEZAR EL VIAJE', text: 'Cierro los ojos. Esta vez voy a dejar que una palabra me lleve a otra.' },
    {
      type: 'image-journey', id: 'viaje-palabras', startNodeId: 'l1-viaje',
      revelation: 'Un viaje fue tu partida,\ncada elección, un lugar;\nuna palabra dio vida\na otra, hasta {VERBO}.',
      teaching: 'Eso es un campo semántico: palabras conectadas por su significado. Una palabra te sugiere otra, aunque cambies de paisaje. No tienen que rimar.\n\nEn la batalla te quedaste en blanco. No te aferres a la palabra que te dan: úsala para encontrar la siguiente.',
      nodes: Object.entries(graph).map(([id, options]) => ({
        id, layer: layerOf(id), options: options.map(([text, destination]) => {
          const optionId = `${id}-${wordId(text)}`;
          return {
            id: optionId, text,
            image: { file: `${optionId}.jpg`, description: `Un camino hacia ${text.toLowerCase()}` },
            ...(ending(destination) ? { ending: destination } : { next: destination }),
          };
        }),
      })),
    },
  ],
  completionLabel: 'Lección completada',
  completionTitle: 'Ya hay chispa.',
  completionSummary: '{COUNT} retos superados. Sigue jugando con tu voz.',
  restartAction: 'Volver a entrenar',
  completion: 'Ya has encontrado el camino. Soy quien dejó la nota. Si quieres volver al ring, puedo enseñarte a seguir encontrando palabras.',
};
