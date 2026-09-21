import { replayJourney, type ImageJourneyChallenge } from '../domain/image-journey';
import type { Message } from './messages';

const presentationWord = (word: string) => `${word.slice(0, 1).toLocaleUpperCase('es-ES')}${word.slice(1).toLocaleLowerCase('es-ES')}`;

export function journeyMessages(challenge: ImageJourneyChallenge, optionIds: readonly string[]): Message[] {
  const replay = replayJourney(challenge, optionIds);
  if (!replay) return [];
  const answers = replay.words.map((text, index) => ({
    id: `${challenge.id}-answer-${index}`,
    role: 'player' as const,
    text: presentationWord(text),
  }));
  if (!replay.ending) return answers;
  return [...answers,
    {
      id: `${challenge.id}-revelation`,
      role: 'master',
      kind: 'verse',
      label: 'Maestro',
      text: challenge.revelation.replace('{VERBO}', replay.ending),
    },
    {
      id: `${challenge.id}-route-question`,
      role: 'master',
      text: '¿Quieres ver el recorrido que has trazado?',
    },
    {
      id: `${challenge.id}-route-action`,
      role: 'player',
      action: 'VER MI RECORRIDO',
      text: 'Quiero ver el recorrido que he hecho.',
    },
    {
      id: `${challenge.id}-route`,
      role: 'master',
      label: 'Tu recorrido',
      text: ['Viaje', ...replay.words.map(presentationWord)].join(' → '),
    },
    { id: `${challenge.id}-teaching`, role: 'master', label: 'Maestro', text: challenge.teaching },
  ];
}
