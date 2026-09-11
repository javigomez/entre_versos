import { z } from 'zod';

export const progressSchema = z.object({
  sessionId: z.string(), started: z.boolean(), completed: z.array(z.string()),
  history: z.array(z.object({ challengeId: z.string(), optionId: z.string() })),
});
export type Progress = z.infer<typeof progressSchema>;
