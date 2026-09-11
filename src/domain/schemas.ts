import { z } from 'zod';

const nonempty = z.string().trim().min(1);
const optionSchema = z.object({ id: nonempty, text: nonempty, emoji: nonempty });

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
export const sessionSchema = z.object({
  id: nonempty,
  startAction: nonempty,
  script: z.array(z.discriminatedUnion('type', [
    z.object({ type: z.literal('master'), text: nonempty }),
    z.object({ type: z.literal('student'), action: nonempty, text: nonempty }),
    challengeSchema,
  ])).min(1),
  completion: nonempty,
}).superRefine((session, ctx) => {
  const challenges = session.script.filter((item): item is z.infer<typeof challengeSchema> => item.type === 'single-choice');
  if (challenges.length === 0) ctx.addIssue({ code: 'custom', message: 'El guion debe tener al menos un reto', path: ['script'] });
  if (new Set(challenges.map(c => c.id)).size !== challenges.length)
    ctx.addIssue({ code: 'custom', message: 'Los retos deben tener IDs únicos', path: ['script'] });
});
export type ScriptItem = z.infer<typeof sessionSchema>['script'][number];
export type Challenge = z.infer<typeof challengeSchema>;
export type Session = z.infer<typeof sessionSchema>;
