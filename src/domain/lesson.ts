import type { Challenge, Lesson } from './schemas';
import { type LessonProgress, storedLessonProgressSchema } from './lesson-progress';

export const challengesOf = (lesson: Lesson): Challenge[] => lesson.script.filter((item): item is Challenge => item.type === 'single-choice');
export const initialProgress = (lesson: Lesson): LessonProgress => ({ lessonId: lesson.id, started: false, completed: [], history: [] });
export function submitChallengeAnswer(lesson: Lesson, progress: LessonProgress, optionId: string): LessonProgress {
  const challenge = challengesOf(lesson)[progress.completed.length];
  if (!progress.started || !challenge || !challenge.options.some(o => o.id === optionId)) return progress;
  return { ...progress,
    completed: optionId === challenge.correctOptionId ? [...progress.completed, challenge.id] : progress.completed,
    history: [...progress.history, { challengeId: challenge.id, optionId }],
  };
}
export function restoreProgress(lesson: Lesson, raw: unknown): LessonProgress {
  const fresh = initialProgress(lesson);
  const parsed = storedLessonProgressSchema.safeParse(raw);
  if (!parsed.success || parsed.data.lessonId !== lesson.id) return fresh;
  const saved = parsed.data;
  const challenges = challengesOf(lesson);
  if (saved.completed.some((id, i) => challenges[i]?.id !== id)) return fresh;
  if (!saved.started) return saved.completed.length || saved.history.length ? fresh : saved;

  const baseline: LessonProgress = { ...saved, history: [] };
  if (!saved.history.length) return baseline;
  const incompatible = () => saved.completed.length ? baseline : fresh;
  const firstIndex = challenges.findIndex(c => c.id === saved.history[0].challengeId);
  if (firstIndex < 0 || firstIndex > saved.completed.length) return incompatible();
  let replay: LessonProgress = { ...fresh, started: true, completed: saved.completed.slice(0, firstIndex) };
  for (const entry of saved.history) {
    if (challenges[replay.completed.length]?.id !== entry.challengeId) return incompatible();
    const next = submitChallengeAnswer(lesson, replay, entry.optionId);
    if (next === replay) return incompatible();
    replay = next;
  }
  if (replay.completed.length !== saved.completed.length ||
      replay.completed.some((id, i) => saved.completed[i] !== id)) return incompatible();
  return replay;
}
