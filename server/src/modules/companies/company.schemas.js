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
