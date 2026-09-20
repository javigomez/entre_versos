import { isChallenge, type Challenge, type Lesson } from './schemas';
import { evaluateChallengeAnswer } from './challenge';
import { replayJourney } from './image-journey';
import { type LessonProgress, storedLessonProgressSchema } from './lesson-progress';

/** Obtiene los retos de la lección en el orden en que aparecen en el guion. */
export const challengesOf = (lesson: Lesson): Challenge[] => lesson.script.filter(isChallenge);
/** Crea el avance de una lección todavía no iniciada, sin logros ni intentos. */
export const initialProgress = (lesson: Lesson): LessonProgress => ({ lessonId: lesson.id, started: false, completed: [], history: [] });
/**
 * Procesa la opción elegida para el reto pendiente.
 * Un error registra el intento sin avanzar; un acierto también supera el reto.
 * Antes de empezar, tras finalizar o ante una opción inexistente, conserva
 * el progreso recibido. No procesa los turnos prefijados del alumno.
 */
export function submitChallengeAnswer(lesson: Lesson, progress: LessonProgress, optionId: string): LessonProgress {
  const challenge = challengesOf(lesson)[progress.completed.length];
  if (!progress.started || !challenge) return progress;
  if (challenge.type === 'image-journey') {
    const optionIds = progress.history
      .filter(entry => entry.challengeId === challenge.id)
      .map(entry => entry.optionId);
    const replay = replayJourney(challenge, [...optionIds, optionId]);
    if (!replay) return progress;
    return {
      ...progress,
      completed: replay.ending ? [...progress.completed, challenge.id] : progress.completed,
      history: [...progress.history, { challengeId: challenge.id, optionId }],
    };
  }
  const result = evaluateChallengeAnswer(challenge, optionId);
  if (result === 'invalid') return progress;
  return { ...progress,
    completed: result === 'completed' ? [...progress.completed, challenge.id] : progress.completed,
    history: [...progress.history, { challengeId: challenge.id, optionId }],
  };
}
/**
 * Recupera progreso guardado para esta lección a partir de datos desconocidos.
 * Acepta la identidad antigua sessionId mediante el lector compatible.
 * No inicia una partida por sí misma ni accede al almacenamiento.
 * Conserva los logros válidos y utiliza la reproducción del historial solo
 * para decidir si puede presentarlo.
 */
export function restoreProgress(lesson: Lesson, raw: unknown): LessonProgress {
  const fresh = initialProgress(lesson);
  const parsed = storedLessonProgressSchema.safeParse(raw);
  if (!parsed.success || parsed.data.lessonId !== lesson.id) return fresh;
  const saved = parsed.data;
  const challenges = challengesOf(lesson);
  const journey = challenges.find(challenge => challenge.type === 'image-journey');
  if (journey?.type === 'image-journey') {
    if (!saved.started) return saved.completed.length || saved.history.length ? fresh : saved;
    if (saved.history.some(entry => entry.challengeId !== journey.id)) return fresh;
    const replay = replayJourney(journey, saved.history.map(entry => entry.optionId));
    if (!replay) return fresh;
    const expected = replay.ending ? [journey.id] : [];
    if (saved.completed.length !== expected.length || saved.completed.some((id, index) => id !== expected[index])) return fresh;
    return saved;
  }
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
