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

const optionalDate = z.coerce.date().nullable().optional();
const experienceFields = {
  title: z.string().trim().min(2).max(160),
  organization: z.string().trim().min(2).max(200),
  location: optionalText(160),
  employmentType: optionalText(100),
  startDate: optionalDate,
  endDate: optionalDate,
  isCurrent: z.boolean(),
  description: optionalText(2_000),
  displayOrder: z.number().int().min(0).max(1_000),
};

function validExperienceDates(experience) {
  return !experience.startDate || !experience.endDate || experience.endDate >= experience.startDate;
}

export const applicantExperienceCreateSchema = z
  .object({
    ...experienceFields,
    isCurrent: experienceFields.isCurrent.default(false),
    displayOrder: experienceFields.displayOrder.default(0),
  })
  .strict()
  .refine(validExperienceDates, {
    message: 'End date must not be earlier than start date.',
    path: ['endDate'],
  });

export const applicantExperienceUpdateSchema = z
  .object(experienceFields)
  .partial()
  .strict()
  .refine((updates) => Object.keys(updates).length > 0, {
    message: 'Provide at least one experience field to update.',
  })
  .refine(validExperienceDates, {
    message: 'End date must not be earlier than start date.',
    path: ['endDate'],
  });

const optionalUrl = z.union([z.url().max(2_048), z.null()]).optional();
const projectFields = {
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(3_000),
  projectUrl: optionalUrl,
  repositoryUrl: optionalUrl,
  technologies: z.array(z.string().trim().min(1).max(100)).max(30),
  startedAt: optionalDate,
  completedAt: optionalDate,
  displayOrder: z.number().int().min(0).max(1_000),
};

function validProjectDates(project) {
  return !project.startedAt || !project.completedAt || project.completedAt >= project.startedAt;
}

export const applicantProjectCreateSchema = z
  .object({
    ...projectFields,
    technologies: projectFields.technologies.default([]),
    displayOrder: projectFields.displayOrder.default(0),
  })
  .strict()
  .refine(validProjectDates, {
    message: 'Completion date must not be earlier than start date.',
    path: ['completedAt'],
  });

export const applicantProjectUpdateSchema = z
  .object(projectFields)
  .partial()
  .strict()
  .refine((updates) => Object.keys(updates).length > 0, {
    message: 'Provide at least one project field to update.',
  })
  .refine(validProjectDates, {
    message: 'Completion date must not be earlier than start date.',
    path: ['completedAt'],
  });

const certificationFields = {
  name: z.string().trim().min(2).max(200),
  issuer: z.string().trim().min(2).max(200),
  issuedAt: optionalDate,
  expiresAt: optionalDate,
  credentialId: optionalText(200),
  credentialUrl: optionalUrl,
  displayOrder: z.number().int().min(0).max(1_000),
};

function validCertificationDates(certification) {
  return !certification.issuedAt
    || !certification.expiresAt
    || certification.expiresAt >= certification.issuedAt;
}

export const applicantCertificationCreateSchema = z
  .object({
    ...certificationFields,
    displayOrder: certificationFields.displayOrder.default(0),
  })
  .strict()
  .refine(validCertificationDates, {
    message: 'Expiration date must not be earlier than issue date.',
    path: ['expiresAt'],
  });

export const applicantCertificationUpdateSchema = z
  .object(certificationFields)
  .partial()
  .strict()
  .refine((updates) => Object.keys(updates).length > 0, {
    message: 'Provide at least one certification field to update.',
  })
  .refine(validCertificationDates, {
    message: 'Expiration date must not be earlier than issue date.',
    path: ['expiresAt'],
  });
