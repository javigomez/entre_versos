import type { Challenge, Session } from './schemas';
import { type Progress, progressSchema } from './progress';

export const challengesOf = (session: Session): Challenge[] => session.script.filter((item): item is Challenge => item.type === 'single-choice');
export const initialProgress = (session: Session): Progress => ({ sessionId: session.id, started: false, completed: [], history: [] });
export function answer(session: Session, progress: Progress, optionId: string): Progress {
  const challenge = challengesOf(session)[progress.completed.length];
  if (!progress.started || !challenge || !challenge.options.some(o => o.id === optionId)) return progress;
  return { ...progress,
    completed: optionId === challenge.correctOptionId ? [...progress.completed, challenge.id] : progress.completed,
    history: [...progress.history, { challengeId: challenge.id, optionId }],
  };
}
export function restoreProgress(session: Session, raw: unknown): Progress {
  const parsed = progressSchema.safeParse(raw);
  if (!parsed.success || parsed.data.sessionId !== session.id) return initialProgress(session);
  let state = { ...initialProgress(session), started: parsed.data.started };
  for (const entry of parsed.data.history) {
    if (challengesOf(session)[state.completed.length]?.id !== entry.challengeId) return initialProgress(session);
    const next = answer(session, state, entry.optionId);
    if (next === state) return initialProgress(session);
    state = next;
  }
  return state;
}
