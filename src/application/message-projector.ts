import type { Challenge, Lesson } from '../domain/schemas';
import type { LessonProgress } from '../domain/lesson-progress';
import { challengesOf } from '../domain/lesson';
import type { Message } from './messages';
import { journeyMessages } from './journey-messages';

export function messagesFor(lesson: Lesson, progress: LessonProgress): Message[] {
  const challenges = challengesOf(lesson);
  const messages: Message[] = [];
  let challengeIndex = 0;
  for (const [scriptIndex, item] of lesson.script.entries()) {
    if (item.type === 'master') {
      messages.push({ id: `master-${scriptIndex}`, role: 'master', text: item.text, kind: 'verse', label: item.label });
      continue;
    }
    if (item.type === 'student') {
      if (!progress.started) break;
      messages.push({ id: `student-${scriptIndex}`, role: 'player', text: item.text, action: item.action });
      continue;
    }
    if (!progress.started || challengeIndex > progress.completed.length) break;
    const challenge: Challenge = item;
    if (challenge.type === 'image-journey') {
      messages.push(...journeyMessages(challenge,
        progress.history.filter(entry => entry.challengeId === challenge.id).map(entry => entry.optionId)));
      challengeIndex += 1;
      if (challengeIndex > progress.completed.length) break;
      continue;
    }
    messages.push({ id: `${challenge.id}-master`, role: 'master', text: challenge.master });
    progress.history.forEach((entry, index) => {
      if (entry.challengeId !== challenge.id) return;
      const option = challenge.options.find(o => o.id === entry.optionId)!;
      messages.push({ id: `answer-${index}`, role: 'player', text: option.text });
      if (challenge.type === 'single-choice') {
        const correct = option.id === challenge.correctOptionId;
        messages.push({ id: `feedback-${index}`, role: 'master', text: correct ? challenge.success : challenge.retry, kind: correct ? 'success' : undefined });
      }
    });
    challengeIndex += 1;
    if (challengeIndex > progress.completed.length) break;
  }
  if (progress.completed.length === challenges.length)
    messages.push({ id: 'completion', role: 'master', text: lesson.completion, label: 'Lección completada' });
  return messages;
}
