import { z } from 'zod';

export const lessonProgressSchema = z.object({
  /** Identitat de la lliçó a la qual pertany aquest progrés. */
  lessonId: z.string(),
  /** Distingeix no haver començat d’haver començat sense superar reptes. */
  started: z.boolean(),
  /** IDs dels reptes superats en ordre; no és una llista de totes les respostes. */
  completed: z.array(z.string()),
  /** Intents en ordre, inclosos errors i repeticions; no equivalen a assoliments. */
  history: z.array(z.object({ challengeId: z.string(), optionId: z.string() })),
});
/**
 * Progrés d’un jugador en una lliçó. Separa els reptes superats de l’historial
 * d’intents i no representa les fases transitòries de la interfície.
 * Els assoliments persistits no es revoquen en editar la solució dels reptes;
 * l’historial incompatible es pot descartar en restaurar.
 */
export type LessonProgress = z.infer<typeof lessonProgressSchema>;

/** Llegeix progrés persistit: normalitza sessionId a lessonId i rebutja objectes amb totes dues identitats. */
export const storedLessonProgressSchema = z.preprocess(raw => {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return raw;
  if (!('sessionId' in raw)) return raw;
  if ('lessonId' in raw) return null;
  const { sessionId, ...rest } = raw;
  return { ...rest, lessonId: sessionId };
}, lessonProgressSchema);
