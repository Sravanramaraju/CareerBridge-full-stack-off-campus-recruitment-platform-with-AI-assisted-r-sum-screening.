import { z } from 'zod';

export const recommendationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(12),
});
