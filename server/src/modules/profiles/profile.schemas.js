import { z } from 'zod';

const optionalText = (maximum) => z.string().trim().max(maximum).nullable().optional();
const preferenceList = z.array(z.string().trim().min(1).max(100)).max(20);

export const applicantProfileUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    headline: optionalText(160),
    phone: optionalText(30),
    location: optionalText(160),
    summary: optionalText(1_500),
    preferences: z
      .object({
        locations: preferenceList.optional(),
        jobTypes: preferenceList.optional(),
        workModes: preferenceList.optional(),
      })
      .strict()
      .refine((preferences) => Object.keys(preferences).length > 0, {
        message: 'Provide at least one preference to update.',
      })
      .optional(),
  })
  .strict()
  .refine((updates) => Object.keys(updates).length > 0, {
    message: 'Provide at least one profile field to update.',
  });
