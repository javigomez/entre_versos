import { z } from 'zod';

const nonempty = z.string().trim().min(1);
/** Alternativa de un reto, formada por texto y emoji obligatorios; su ID permite referenciarla dentro del reto. */
const optionSchema = z.object({ id: nonempty, text: nonempty, emoji: nonempty });
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const imageOptionSchema = z.object({ id: slug, text: z.string().trim().min(1).refine(v => !/\s/.test(v), 'La opción debe ser una palabra'), image: z.object({ file: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*\.jpg$/), description: nonempty }).strict() }).strict();

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
export const imageChoiceChallengeSchema = z.object({
  type: z.literal('image-choice'), id: slug, master: nonempty, prompt: nonempty,
  options: z.array(imageOptionSchema).length(2),
}).strict().superRefine((challenge, ctx) => {
  if (new Set(challenge.options.map(o => o.id)).size !== challenge.options.length) ctx.addIssue({ code: 'custom', message: 'Las opciones deben tener IDs únicos', path: ['options'] });
});
const scriptItemSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('master'), text: nonempty }),
  z.object({ type: z.literal('student'), action: nonempty, text: nonempty }),
  challengeSchema, imageChoiceChallengeSchema,
]);
/** Valida el contenido de una lección: guion no vacío, al menos un reto e IDs de reto únicos. */
export const lessonSchema = z.object({
  id: nonempty,
  startAction: nonempty,
  script: z.array(scriptItemSchema).min(1),
  completion: nonempty,
}).superRefine((lesson, ctx) => {
  const challenges = lesson.script.filter(isChallenge);
  if (challenges.length === 0) ctx.addIssue({ code: 'custom', message: 'El guion debe tener al menos un reto', path: ['script'] });
  if (new Set(challenges.map(c => c.id)).size !== challenges.length)
    ctx.addIssue({ code: 'custom', message: 'Los retos deben tener IDs únicos', path: ['script'] });
});
export type SingleChoiceChallenge = z.infer<typeof challengeSchema>;
export type ImageChoiceChallenge = z.infer<typeof imageChoiceChallengeSchema>;
export function isChallenge(step: LessonStep): step is Challenge { return step.type === 'single-choice' || step.type === 'image-choice'; }
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
export type Challenge = SingleChoiceChallenge | ImageChoiceChallenge;
/**
 * Unidad de aprendizaje presentada mediante un guion ordenado de
 * intervenciones y retos. Su identidad se conserva al mejorar su contenido.
 * No representa una partida concreta ni una sesión de uso de la aplicación.
 */
export type Lesson = z.infer<typeof lessonSchema>;
