import { z } from 'zod';

export const lessonProgressSchema = z.object({
  lessonId: z.string(),
  started: z.boolean(),
  completed: z.array(z.string()),
  history: z.array(z.object({ challengeId: z.string(), optionId: z.string() })),
});
export type LessonProgress = z.infer<typeof lessonProgressSchema>;

export const storedLessonProgressSchema = z.preprocess(raw => {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return raw;
  if (!('sessionId' in raw)) return raw;
  if ('lessonId' in raw) return null;
  const { sessionId, ...rest } = raw;
  return { ...rest, lessonId: sessionId };
}, lessonProgressSchema);
