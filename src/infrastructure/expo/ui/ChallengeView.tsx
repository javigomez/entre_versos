import type { ImageChoiceChallenge as ImageChoiceContent, SingleChoiceChallenge as SingleChoiceContent, TextChoiceChallenge as TextChoiceContent } from '../../../domain/schemas';
import { SingleChoiceChallenge } from './SingleChoiceChallenge';
import { ImageChoiceChallenge } from './ImageChoiceChallenge';
import { TextChoiceChallengeView } from './TextChoiceChallenge';
import type { ControlTarget } from './viewport/useConversationViewport';
import type { ChallengeImageResolver } from '../content/content-images';
export function ChallengeView({ challenge, onAnswer, resolveImage, disabled, selectedOptionId }: { challenge: SingleChoiceContent | TextChoiceContent | ImageChoiceContent; onAnswer: (id: string, target: ControlTarget) => void; resolveImage: ChallengeImageResolver; disabled?: boolean; selectedOptionId?: string }) {
  if (challenge.type === 'single-choice') return <SingleChoiceChallenge challenge={challenge} onAnswer={onAnswer} disabled={disabled} selectedOptionId={selectedOptionId} />;
  if (challenge.type === 'text-choice') return <TextChoiceChallengeView challenge={challenge} onAnswer={onAnswer} disabled={disabled} selectedOptionId={selectedOptionId} />;
  return <ImageChoiceChallenge challenge={challenge} onAnswer={onAnswer} resolveImage={resolveImage} disabled={disabled} selectedOptionId={selectedOptionId} />;
}
