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

export const profileRecordParamsSchema = z.object({
  recordId: z.string().trim().min(1).max(128),
});

const educationFields = {
  institution: z.string().trim().min(2).max(200),
  qualification: z.string().trim().min(2).max(200),
  fieldOfStudy: optionalText(160),
  startYear: z.number().int().min(1950).max(2100).nullable().optional(),
  endYear: z.number().int().min(1950).max(2100).nullable().optional(),
  isCurrent: z.boolean(),
  grade: optionalText(50),
  description: optionalText(1_000),
  displayOrder: z.number().int().min(0).max(1_000),
};

function validEducationYears(education) {
  return !education.startYear || !education.endYear || education.endYear >= education.startYear;
}

export const applicantEducationCreateSchema = z
  .object({
    ...educationFields,
    isCurrent: educationFields.isCurrent.default(false),
    displayOrder: educationFields.displayOrder.default(0),
  })
  .strict()
  .refine(validEducationYears, {
    message: 'End year must not be earlier than start year.',
    path: ['endYear'],
  });

export const applicantEducationUpdateSchema = z
  .object(educationFields)
  .partial()
  .strict()
  .refine((updates) => Object.keys(updates).length > 0, {
    message: 'Provide at least one education field to update.',
  })
  .refine(validEducationYears, {
    message: 'End year must not be earlier than start year.',
    path: ['endYear'],
  });
