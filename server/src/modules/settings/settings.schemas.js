import { z } from 'zod';

export const settingsUpdateSchema = z
  .object({
    applicationUpdates: z.boolean().optional(),
    jobRecommendations: z.boolean().optional(),
    careerResources: z.boolean().optional(),
    newApplications: z.boolean().optional(),
    candidateReminders: z.boolean().optional(),
    jobExpiryReminders: z.boolean().optional(),
    weeklySummary: z.boolean().optional(),
  })
  .strict()
  .refine((updates) => Object.keys(updates).length > 0, {
    message: 'Provide at least one setting to update.',
  });
