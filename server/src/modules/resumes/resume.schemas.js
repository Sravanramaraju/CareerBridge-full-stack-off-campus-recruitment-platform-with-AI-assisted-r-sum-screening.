import { z } from 'zod';

export const resumeParamsSchema = z.object({
  resumeId: z.string().trim().min(1).max(128),
});
