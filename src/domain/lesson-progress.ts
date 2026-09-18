import { z } from 'zod';

export const lessonProgressSchema = z.object({
  /** Identidad de la lección a la que pertenece este avance. */
  lessonId: z.string(),
  /** Distingue no haber empezado de haber empezado sin superar retos. */
  started: z.boolean(),
  /** IDs de retos superados en orden; no una lista de todas las respuestas. */
  completed: z.array(z.string()),
  /** Intentos en orden, incluidos errores y repeticiones; no equivalen a logros. */
  history: z.array(z.object({ challengeId: z.string(), optionId: z.string() })),
});
/**
 * Avance de un jugador en una lección. Separa los retos superados del historial
 * de intentos y no representa las fases transitorias de la interfaz.
 * Los logros persistidos no se revocan al editar la solución de los retos;
 * el historial incompatible puede descartarse al restaurar.
 */
export type LessonProgress = z.infer<typeof lessonProgressSchema>;

/** Lee progreso persistido: normaliza sessionId a lessonId y rechaza objetos con ambas identidades. */
export const storedLessonProgressSchema = z.preprocess(raw => {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return raw;
  if (!('sessionId' in raw)) return raw;
  if ('lessonId' in raw) return null;
  const { sessionId, ...rest } = raw;
  return { ...rest, lessonId: sessionId };
}, lessonProgressSchema);
