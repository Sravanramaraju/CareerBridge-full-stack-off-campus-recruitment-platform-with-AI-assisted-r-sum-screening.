import { z } from 'zod';

const optionalSearch = z.string().trim().max(100).optional();
const facetList = z.preprocess(
  (value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]),
  z.array(z.string().trim().min(1).max(100)).max(20),
);

export const publicJobListQuerySchema = z.object({
  q: optionalSearch,
  location: optionalSearch,
  experience: optionalSearch,
  types: facetList,
  modes: facetList,
  salaryBands: facetList,
  industries: facetList,
  skills: facetList,
  experiences: facetList,
  locations: facetList,
  companyTypes: facetList,
  datePosted: z.enum(['1', '3', '7', '30']).optional(),
  sort: z.enum(['recommended', 'newest', 'salary']).default('recommended'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export const jobIdentifierParamsSchema = z.object({
  jobId: z.string().trim().min(1).max(128),
});
