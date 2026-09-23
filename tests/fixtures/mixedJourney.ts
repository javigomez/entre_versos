import type { Lesson } from '../../src/domain/schemas';
import { journeyLesson } from './journey';

export const mixedJourneyLesson: Lesson = {
  ...journeyLesson,
  id: 'mixed-journey-test-v1',
  script: [
    ...journeyLesson.script,
    { type: 'mestre', kind: 'prose', label: 'Mestre', text: 'Ara practiquem.' },
    { type: 'student', action: "EXPLICA-M'HO", text: 'Vull aprendre el truc.' },
    {
      type: 'text-choice', id: 'porta-musica',
      mestre: 'MÚSICA necessita una porta.', prompt: 'MÚSICA → ?',
      options: [
        { id: 'cantar', text: 'CANTAR' },
        { id: 'pintar', text: 'PINTAR' },
        { id: 'nedar', text: 'NEDAR' },
        { id: 'tancar', text: 'TANCAR' },
      ],
      correctOptionId: 'cantar', success: 'CANTAR.', retry: 'Busca el significat.',
    },
  ],
  completionLabel: 'Lliçó completada',
  completionTitle: 'Viatge acabat.',
  completionSummary: 'Has superat {COUNT} reptes.',
  restartAction: 'Tornar a entrenar',
  completion: 'Lliçó completada.',
};
