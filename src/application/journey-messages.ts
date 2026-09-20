import { replayJourney, type ImageJourneyChallenge } from '../domain/image-journey';
import type { Message } from './messages';

export function journeyMessages(challenge: ImageJourneyChallenge, optionIds: readonly string[]): Message[] {
  const replay = replayJourney(challenge, optionIds);
  if (!replay?.ending) return [];
  return [
    {
      id: `${challenge.id}-revelation`,
      role: 'master',
      kind: 'verse',
      label: 'Maestro',
      text: challenge.revelation.replace('{VERBO}', replay.ending.toUpperCase()),
    },
    {
      id: `${challenge.id}-route`,
      role: 'player',
      label: 'Tu recorrido',
      text: ['VIAJE', ...replay.words].join(' → '),
    },
    { id: `${challenge.id}-teaching`, role: 'master', label: 'Maestro', text: challenge.teaching },
  ];
}
