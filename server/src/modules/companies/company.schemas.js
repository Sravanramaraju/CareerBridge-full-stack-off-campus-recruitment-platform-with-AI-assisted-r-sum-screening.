import { z } from 'zod';

const optionalFilter = z.string().trim().min(1).max(100).optional();

export const companyListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  industry: optionalFilter,
  size: optionalFilter,
  location: optionalFilter,
  companyType: optionalFilter,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export const companyIdentifierParamsSchema = z.object({
  companyId: z.string().trim().min(1).max(128),
});

const optionalWebsite = z
  .union([z.url().max(2_048), z.literal('')])
  .transform((value) => value || null);

export const recruiterCompanyUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(160).optional(),
    industry: z.string().trim().min(2).max(100).optional(),
    website: optionalWebsite.optional(),
    size: z.string().trim().min(1).max(100).nullable().optional(),
    about: z.string().trim().max(800).nullable().optional(),
    companyType: z.string().trim().min(1).max(100).nullable().optional(),
    headquarters: z.string().trim().min(1).max(160).nullable().optional(),
    foundedYear: z.number().int().min(1800).max(new Date().getUTCFullYear()).nullable().optional(),
    benefits: z.array(z.string().trim().min(1).max(120)).max(30).optional(),
    locations: z.array(z.string().trim().min(1).max(160)).max(30).optional(),
  })
  .strict()
  .refine((updates) => Object.keys(updates).length > 0, {
    message: 'Provide at least one company field to update.',
  });
