import type { Lesson } from '../../src/domain/schemas';
import { journeyLesson } from './journey';

export const mixedJourneyLesson: Lesson = {
  ...journeyLesson,
  id: 'mixed-journey-test-v1',
  script: [
    ...journeyLesson.script,
    { type: 'master', kind: 'prose', label: 'Mestre', text: 'Ara practiquem.' },
    { type: 'student', action: "EXPLICA-M'HO", text: 'Vull aprendre el truc.' },
    {
      type: 'text-choice', id: 'porta-musica',
      master: 'MÚSICA necessita una porta.', prompt: 'MÚSICA → ?',
      options: [
        { id: 'cantar', text: 'CANTAR' },
        { id: 'pintar', text: 'PINTAR' },
        { id: 'nedar', text: 'NEDAR' },
        { id: 'tancar', text: 'TANCAR' },
      ],
      correctOptionId: 'cantar', success: 'CANTAR.', retry: 'Busca el significat.',
    },
  ],
  completion: 'Lliçó completada.',
};
