import { z } from 'zod';

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
  experience: optionalSearch,
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
