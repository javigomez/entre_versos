import { z } from 'zod';

const nonempty = z.string().trim().min(1);
/** Alternativa de un reto, formada por texto y emoji obligatorios; su ID permite referenciarla dentro del reto. */
const optionSchema = z.object({ id: nonempty, text: nonempty, emoji: nonempty });

/** Valida cuatro opciones con IDs únicos y una solución que referencia una de ellas. */
export const challengeSchema = z.object({
  type: z.literal('single-choice'),
  id: nonempty,
  master: nonempty,
  prompt: nonempty,
  options: z.array(optionSchema).length(4),
  correctOptionId: nonempty,
  success: nonempty,
  retry: nonempty,
}).superRefine((challenge, ctx) => {
  if (new Set(challenge.options.map(o => o.id)).size !== challenge.options.length)
    ctx.addIssue({ code: 'custom', message: 'Las opciones deben tener IDs únicos', path: ['options'] });
  if (!challenge.options.some(o => o.id === challenge.correctOptionId))
    ctx.addIssue({ code: 'custom', message: 'La respuesta correcta debe existir', path: ['correctOptionId'] });
});
/** Valida el contenido de una lección: guion no vacío, al menos un reto e IDs de reto únicos. */
export const lessonSchema = z.object({
  id: nonempty,
  startAction: nonempty,
  script: z.array(z.discriminatedUnion('type', [
    z.object({ type: z.literal('master'), text: nonempty }),
    z.object({ type: z.literal('student'), action: nonempty, text: nonempty }),
    challengeSchema,
  ])).min(1),
  completion: nonempty,
}).superRefine((lesson, ctx) => {
  const challenges = lesson.script.filter((item): item is z.infer<typeof challengeSchema> => item.type === 'single-choice');
  if (challenges.length === 0) ctx.addIssue({ code: 'custom', message: 'El guion debe tener al menos un reto', path: ['script'] });
  if (new Set(challenges.map(c => c.id)).size !== challenges.length)
    ctx.addIssue({ code: 'custom', message: 'Los retos deben tener IDs únicos', path: ['script'] });
});
/**
 * Elemento del guion: intervención del maestro, turno prefijado del alumno
 * que requiere confirmación o reto completo. Un reto puede generar varios
 * turnos de conversación; un paso no equivale necesariamente a un mensaje.
 */
export type LessonStep = z.infer<typeof lessonSchema>['script'][number];
/**
 * Reto de elección única con cuatro opciones y una solución.
 * Su ID lo identifica dentro de la lección aunque se edite su contenido.
 * Contiene el enunciado y el feedback; no contiene las respuestas del jugador.
 */
export type Challenge = z.infer<typeof challengeSchema>;
/**
 * Unidad de aprendizaje presentada mediante un guion ordenado de
 * intervenciones y retos. Su identidad se conserva al mejorar su contenido.
 * No representa una partida concreta ni una sesión de uso de la aplicación.
 */
export type Lesson = z.infer<typeof lessonSchema>;
