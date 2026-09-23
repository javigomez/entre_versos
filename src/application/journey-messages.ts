import { replayJourney, type ImageJourneyChallenge } from '../domain/image-journey';
import type { Message } from './messages';

const presentationWord = (word: string) => `${word.slice(0, 1).toLocaleUpperCase('ca-ES')}${word.slice(1).toLocaleLowerCase('ca-ES')}`;

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
    mestreLabel: 'Mestre', routeQuestion: 'Vols veure el recorregut que has traçat?',
    routeAction: 'VEURE EL MEU RECORREGUT', routeAnswer: 'Vull veure el recorregut que he fet.',
    routeLabel: 'El teu recorregut', routeStart: 'Viatge',
  };
  return [...answers,
    {
      id: `${challenge.id}-revelation`,
      role: 'mestre',
      kind: 'verse',
      label: presentation.mestreLabel,
      text: challenge.revelation.replace('{VERBO}', replay.ending),
    },
    {
      id: `${challenge.id}-route-question`,
      role: 'mestre',
      label: presentation.mestreLabel,
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
      role: 'mestre',
      label: presentation.routeLabel,
      text: [presentation.routeStart, ...replay.words.map(presentationWord)].join(' → '),
    },
    { id: `${challenge.id}-teaching`, role: 'mestre', label: presentation.mestreLabel, text: challenge.teaching },
  ];
}
