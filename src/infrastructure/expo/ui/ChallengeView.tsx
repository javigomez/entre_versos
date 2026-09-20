import type { Challenge } from '../../../domain/schemas';
import { SingleChoiceChallenge } from './SingleChoiceChallenge';
import { ImageChoiceChallenge } from './ImageChoiceChallenge';
import type { ControlTarget } from './viewport/useConversationViewport';
import type { ChallengeImageResolver } from '../content/content-images';
export function ChallengeView({ challenge, onAnswer, resolveImage, disabled, selectedOptionId }: { challenge: Challenge; onAnswer: (id: string, target: ControlTarget) => void; resolveImage: ChallengeImageResolver; disabled?: boolean; selectedOptionId?: string }) {
  if (challenge.type === 'single-choice') return <SingleChoiceChallenge challenge={challenge} onAnswer={onAnswer} disabled={disabled} selectedOptionId={selectedOptionId} />;
  return <ImageChoiceChallenge challenge={challenge} onAnswer={onAnswer} resolveImage={resolveImage} disabled={disabled} selectedOptionId={selectedOptionId} />;
}
