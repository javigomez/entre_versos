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
  const presentation = challenge.presentation ?? {
    masterLabel: 'Maestro', routeQuestion: '¿Quieres ver el recorrido que has trazado?',
    routeAction: 'VER MI RECORRIDO', routeAnswer: 'Quiero ver el recorrido que he hecho.',
    routeLabel: 'Tu recorrido', routeStart: 'Viaje',
  };
  return [...answers,
    {
      id: `${challenge.id}-revelation`,
      role: 'master',
      kind: 'verse',
      label: presentation.masterLabel,
      text: challenge.revelation.replace('{VERBO}', replay.ending),
    },
    {
      id: `${challenge.id}-route-question`,
      role: 'master',
      label: presentation.masterLabel,
      text: presentation.routeQuestion,
    },
    {
      id: `${challenge.id}-route-action`,
      role: 'player',
      action: presentation.routeAction,
      text: presentation.routeAnswer,
    },
    {
      id: `${challenge.id}-route`,
      role: 'master',
      label: presentation.routeLabel,
      text: [presentation.routeStart, ...replay.words.map(presentationWord)].join(' → '),
    },
    { id: `${challenge.id}-teaching`, role: 'master', label: presentation.masterLabel, text: challenge.teaching },
  ];
}
