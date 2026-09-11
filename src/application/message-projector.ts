import type { Challenge, Session } from '../domain/schemas';
import type { Progress } from '../domain/progress';
import { challengesOf } from '../domain/session';
import type { Message } from './messages';

export function messagesFor(session: Session, progress: Progress): Message[] {
  const challenges = challengesOf(session);
  const messages: Message[] = [];
  let challengeIndex = 0;
  for (const [scriptIndex, item] of session.script.entries()) {
    if (item.type === 'master') {
      messages.push({ id: `master-${scriptIndex}`, role: 'master', text: item.text, kind: 'verse' });
      continue;
    }
    if (item.type === 'student') {
      if (!progress.started) break;
      messages.push({ id: `student-${scriptIndex}`, role: 'player', text: item.text, action: item.action });
      continue;
    }
    if (!progress.started || challengeIndex > progress.completed.length) break;
    const challenge: Challenge = item;
    messages.push({ id: `${challenge.id}-master`, role: 'master', text: challenge.master });
    progress.history.forEach((entry, index) => {
      if (entry.challengeId !== challenge.id) return;
      const option = challenge.options.find(o => o.id === entry.optionId)!;
      const correct = option.id === challenge.correctOptionId;
      messages.push({ id: `answer-${index}`, role: 'player', text: option.text });
      messages.push({ id: `feedback-${index}`, role: 'master', text: correct ? challenge.success : challenge.retry, kind: correct ? 'success' : undefined });
    });
    challengeIndex += 1;
    if (challengeIndex > progress.completed.length) break;
  }
  if (progress.completed.length === challenges.length)
    messages.push({ id: 'completion', role: 'master', text: session.completion, label: 'Sesión completada' });
  return messages;
}
