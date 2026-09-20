// tests/fixtures/journey.ts
import type { ImageJourneyChallenge } from '../../src/domain/image-journey';
import type { Lesson } from '../../src/domain/schemas';
export const journey: ImageJourneyChallenge = {
  type: 'image-journey', id: 'viaje-palabras', startNodeId: 'n1',
  nodes: Array.from({ length: 6 }, (_, i) => ({
    id: `n${i + 1}`, layer: i + 1,
    options: ['a', 'b'].map((side, sideIndex) => ({
      id: `n${i + 1}-${side}`,
      text: i === 5 ? ['NADAR', 'REMAR'][sideIndex] : `PASO${i + 1}${side.toUpperCase()}`,
      image: { file: `n${i + 1}-${side}.jpg`, description: `Camino ${side} de la etapa ${i + 1}` },
      ...(i === 5 ? { ending: sideIndex === 0 ? 'nadar' as const : 'remar' as const }
        : { next: `n${i + 2}` }),
    })),
  })),
  revelation: 'Un viaje fue tu partida,\ncada elección, un lugar;\nuna palabra dio vida\na otra, hasta {VERBO}.',
  teaching: 'Eso es un campo semántico. Una palabra te sugiere otra; no tienen que rimar.',
};
export const journeyLesson: Lesson = {
  id: 'journey-test-v1', startAction: 'LEVANTARME', startWithStudent: true,
  script: [
    { type: 'master', text: 'Has perdido la batalla.', label: 'Voz' },
    { type: 'student', action: 'LEVANTARME', text: 'Me quedé sin palabras.' },
    { type: 'master', text: 'Encuentras una nota.', label: 'Voz' },
    { type: 'student', action: 'VER NOTA', text: 'Leo la nota.' },
    { type: 'master', text: 'Elige sin buscar aciertos.', label: 'Nota' },
    { type: 'student', action: 'EMPEZAR EL VIAJE', text: 'Cierro los ojos.' },
    journey,
  ],
  completion: 'Puedo enseñarte a seguir encontrando palabras.',
};
