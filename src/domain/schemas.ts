import { z } from 'zod';
import { imageJourneySchema, type ImageJourneyChallenge } from './image-journey';

const nonempty = z.string().trim().min(1);
/** Alternativa d’un repte, formada per text i emoji obligatoris; l’ID permet referenciar-la dins del repte. */
const optionSchema = z.object({ id: nonempty, text: nonempty, emoji: nonempty });
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const imageOptionSchema = z.object({ id: slug, text: z.string().trim().min(1).refine(v => !/\s/.test(v), 'L’opció ha de ser una paraula'), image: z.object({ file: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*\.jpg$/), description: nonempty }).strict() }).strict();
const textOptionSchema = z.object({ id: slug, text: z.string().trim().min(1).max(44) }).strict();

/** Valida quatre opcions amb IDs únics i una solució que en referencia una. */
export const challengeSchema = z.object({
  type: z.literal('single-choice'),
  id: nonempty,
  mestre: nonempty,
  prompt: nonempty,
  options: z.array(optionSchema).length(4),
  correctOptionId: nonempty,
  success: nonempty,
  retry: nonempty,
}).superRefine((challenge, ctx) => {
  if (new Set(challenge.options.map(o => o.id)).size !== challenge.options.length)
    ctx.addIssue({ code: 'custom', message: 'Les opcions han de tenir IDs únics', path: ['options'] });
  if (!challenge.options.some(o => o.id === challenge.correctOptionId))
    ctx.addIssue({ code: 'custom', message: 'La resposta correcta ha d’existir', path: ['correctOptionId'] });
});
export const imageChoiceChallengeSchema = z.object({
  type: z.literal('image-choice'), id: slug, mestre: nonempty, prompt: nonempty,
  options: z.array(imageOptionSchema).length(2),
}).strict().superRefine((challenge, ctx) => {
  if (new Set(challenge.options.map(o => o.id)).size !== challenge.options.length) ctx.addIssue({ code: 'custom', message: 'Les opcions han de tenir IDs únics', path: ['options'] });
});
export const textChoiceChallengeSchema = z.object({
  type: z.literal('text-choice'), id: slug, mestre: nonempty, prompt: nonempty,
  options: z.array(textOptionSchema).refine(options => options.length === 2 || options.length === 4,
    'El repte textual necessita dues o quatre opcions'),
  correctOptionId: slug, success: nonempty, retry: nonempty,
}).strict().superRefine((challenge, ctx) => {
  if (new Set(challenge.options.map(option => option.id)).size !== challenge.options.length)
    ctx.addIssue({ code: 'custom', message: 'Les opcions han de tenir IDs únics', path: ['options'] });
  if (!challenge.options.some(option => option.id === challenge.correctOptionId))
    ctx.addIssue({ code: 'custom', message: 'La resposta correcta ha d’existir', path: ['correctOptionId'] });
});
const scriptItemSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('mestre'), text: nonempty, label: nonempty.optional(), kind: z.enum(['verse', 'prose']).optional() }),
  z.object({ type: z.literal('student'), action: nonempty, text: nonempty }),
  challengeSchema, textChoiceChallengeSchema, imageChoiceChallengeSchema, imageJourneySchema,
]);
/** Valida el contingut d’una lliçó: guió no buit, almenys un repte i IDs de repte únics. */
export const lessonSchema = z.object({
  id: nonempty,
  startAction: nonempty,
  startWithStudent: z.boolean().optional(),
  script: z.array(scriptItemSchema).min(1),
  completionLabel: nonempty,
  completion: nonempty,
  completionTitle: nonempty,
  completionSummary: nonempty.refine(
    value => (value.match(/\{COUNT\}/g) ?? []).length === 1,
    'El resum final necessita exactament un marcador {COUNT}',
  ),
  restartAction: nonempty,
}).superRefine((lesson, ctx) => {
  const challenges = lesson.script.filter(isChallenge);
  if (challenges.length === 0) ctx.addIssue({ code: 'custom', message: 'El guió ha de tenir almenys un repte', path: ['script'] });
  if (new Set(challenges.map(c => c.id)).size !== challenges.length)
    ctx.addIssue({ code: 'custom', message: 'Els reptes han de tenir IDs únics', path: ['script'] });
  const journeys = lesson.script.filter(item => item.type === 'image-journey');
  if (journeys.length > 1)
    ctx.addIssue({ code: 'custom', message: 'La lliçó admet com a màxim un viatge', path: ['script'] });
  if (lesson.startWithStudent) {
    const firstReply = lesson.script[1];
    if (lesson.script[0]?.type !== 'mestre' || firstReply?.type !== 'student' || firstReply.action !== lesson.startAction)
      ctx.addIssue({ code: 'custom', message: 'startWithStudent necessita una resposta inicial coincident', path: ['startWithStudent'] });
  }
});
export type SingleChoiceChallenge = z.infer<typeof challengeSchema>;
export type TextChoiceChallenge = z.infer<typeof textChoiceChallengeSchema>;
export type ScoredChallenge = SingleChoiceChallenge | TextChoiceChallenge;
export type ImageChoiceChallenge = z.infer<typeof imageChoiceChallengeSchema>;
export function isChallenge(step: LessonStep): step is Challenge {
  return step.type === 'single-choice' || step.type === 'text-choice' || step.type === 'image-choice' || step.type === 'image-journey';
}
export function isScoredChallenge(challenge: Challenge): challenge is ScoredChallenge {
  return challenge.type === 'single-choice' || challenge.type === 'text-choice';
}
/**
 * Element del guió: intervenció del mestre, torn prefixat de l’alumne
 * que necessita confirmació o repte complet. Un repte pot generar diversos
 * torns de conversa; un pas no equival necessàriament a un missatge.
 */
export type LessonStep = z.infer<typeof lessonSchema>['script'][number];
/**
 * Repte d’elecció única amb quatre opcions i una solució.
 * L’ID l’identifica dins de la lliçó encara que se n’editi el contingut.
 * Conté l’enunciat i el retorn; no conté les respostes del jugador.
 */
export type Challenge = ScoredChallenge | ImageChoiceChallenge | ImageJourneyChallenge;
/**
 * Unitat d’aprenentatge presentada mitjançant un guió ordenat
 * d’intervencions i reptes. La identitat es conserva en millorar-ne el contingut.
 * No representa una partida concreta ni una sessió d’ús de l’aplicació.
 */
export type Lesson = z.infer<typeof lessonSchema>;
