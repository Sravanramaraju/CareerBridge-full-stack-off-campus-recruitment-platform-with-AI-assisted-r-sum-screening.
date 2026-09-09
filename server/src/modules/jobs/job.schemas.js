import { z } from 'zod';
import { canonicalizeSkillName, normalizeSkillName } from '../profiles/skillNormalization.js';

const optionalSearch = z.string().trim().max(100).optional();
const employmentType = z.enum(['Full-time', 'Part-time', 'Internship', 'Contract']);
const workMode = z.enum(['On-site', 'Hybrid', 'Remote']);
const experienceLevel = z.enum(['Fresher', '0–1 years', '1–2 years', '2–3 years']);
const salaryBand = z.enum(['Up to ₹5 LPA', '₹5–8 LPA', '₹8+ LPA']);
const companyType = z.enum(['Startup', 'MNC', 'Product', 'Consulting']);

function facetList(itemSchema = z.string().trim().min(1).max(100)) {
  return z.preprocess(
    (value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]),
    z.array(itemSchema).max(20),
  );
}

export const publicJobListQuerySchema = z.object({
  q: optionalSearch,
  location: optionalSearch,
  experience: experienceLevel.optional(),
  types: facetList(employmentType),
  modes: facetList(workMode),
  salaryBands: facetList(salaryBand),
  industries: facetList(),
  skills: facetList(),
  experiences: facetList(experienceLevel),
  locations: facetList(),
  companyTypes: facetList(companyType),
  datePosted: z.enum(['1', '3', '7', '30']).optional(),
  sort: z.enum(['recommended', 'newest', 'salary']).default('recommended'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export const jobIdentifierParamsSchema = z.object({
  jobId: z.string().trim().min(1).max(128),
});

const draftText = (maximum) => z.string().trim().max(maximum).nullable().optional();
const nullableDate = z.coerce.date().nullable().optional();
const skillInput = z.object({
  name: z.string().transform(canonicalizeSkillName).pipe(z.string().min(1).max(100)),
  requirement: z.enum(['REQUIRED', 'PREFERRED']).default('REQUIRED'),
}).strict();
const screeningQuestionInput = z.object({
  question: z.string().trim().min(5).max(500),
  required: z.boolean().default(false),
}).strict();

const recruiterJobFields = {
  title: z.string().trim().min(2).max(200),
  department: draftText(160),
  category: draftText(160),
  location: draftText(200),
  workMode: z.enum(['ON_SITE', 'HYBRID', 'REMOTE']).nullable().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT']).nullable().optional(),
  openings: z.number().int().min(1).max(1_000),
  experienceMin: z.number().int().min(0).max(80),
  experienceMax: z.number().int().min(0).max(80),
  salaryMin: z.number().min(0).max(1_000_000_000).nullable().optional(),
  salaryMax: z.number().min(0).max(1_000_000_000).nullable().optional(),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  hideSalary: z.boolean(),
  summary: draftText(500),
  description: draftText(10_000),
  responsibilities: z.array(z.string().trim().min(2).max(500)).max(30),
  qualification: draftText(1_000),
  contactVisible: z.boolean(),
  deadline: nullableDate,
  skills: z.array(skillInput).max(30),
  screeningQuestions: z.array(screeningQuestionInput).max(5),
};

function validJobRanges(job) {
  if (job.experienceMin !== undefined && job.experienceMax !== undefined
    && job.experienceMax < job.experienceMin) return false;
  return !(job.salaryMin !== undefined && job.salaryMin !== null
    && job.salaryMax !== undefined && job.salaryMax !== null
    && job.salaryMax < job.salaryMin);
}

function uniqueJobSkills(job, context) {
  if (!job.skills) return;
  const names = new Set();
  job.skills.forEach((skill, index) => {
    const normalized = normalizeSkillName(skill.name);
    if (names.has(normalized)) context.addIssue({
      code: 'custom',
      message: 'Each skill may be included only once.',
      path: ['skills', index, 'name'],
    });
    names.add(normalized);
  });
}

export const recruiterJobCreateSchema = z.object({
  ...recruiterJobFields,
  title: recruiterJobFields.title.default('Untitled role'),
  openings: recruiterJobFields.openings.default(1),
  experienceMin: recruiterJobFields.experienceMin.default(0),
  experienceMax: recruiterJobFields.experienceMax.default(0),
  currency: recruiterJobFields.currency.default('INR'),
  hideSalary: recruiterJobFields.hideSalary.default(false),
  responsibilities: recruiterJobFields.responsibilities.default([]),
  contactVisible: recruiterJobFields.contactVisible.default(true),
  skills: recruiterJobFields.skills.default([]),
  screeningQuestions: recruiterJobFields.screeningQuestions.default([]),
}).strict().refine(validJobRanges, {
  message: 'Maximum values must not be lower than minimum values.',
  path: ['experienceMax'],
}).superRefine(uniqueJobSkills);

export const recruiterJobUpdateSchema = z.object(recruiterJobFields)
  .partial()
  .strict()
  .refine((updates) => Object.keys(updates).length > 0, {
    message: 'Provide at least one job field to update.',
  })
  .refine(validJobRanges, {
    message: 'Maximum values must not be lower than minimum values.',
    path: ['experienceMax'],
  })
  .superRefine(uniqueJobSkills);
