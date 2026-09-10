import { z } from 'zod';

const resourceId = z.string().trim().min(1).max(128);
const pageFields = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
};
const moderationReason = z.string().trim().min(3).max(500).nullable().optional();

export const adminCompanyListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(['PENDING', 'VERIFIED', 'NEEDS_CHANGES', 'REJECTED']).optional(),
  ...pageFields,
}).strict();

export const adminCompanyParamsSchema = z.object({ companyId: resourceId }).strict();

export const companyVerificationSchema = z.object({
  status: z.enum(['VERIFIED', 'NEEDS_CHANGES', 'REJECTED']),
  reason: moderationReason,
}).strict().superRefine((input, context) => {
  if (input.status !== 'VERIFIED' && !input.reason) context.addIssue({
    code: 'custom', path: ['reason'], message: 'A reason is required for this verification result.',
  });
});

export const adminJobListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  moderationStatus: z.enum(['PENDING', 'CLEARED', 'FLAGGED', 'DEACTIVATED']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).optional(),
  ...pageFields,
}).strict();

export const adminJobParamsSchema = z.object({ jobId: resourceId }).strict();

export const jobModerationSchema = z.object({
  action: z.enum(['CLEAR', 'FLAG', 'DEACTIVATE']),
  reason: moderationReason,
}).strict().superRefine((input, context) => {
  if (input.action !== 'CLEAR' && !input.reason) context.addIssue({
    code: 'custom', path: ['reason'], message: 'A reason is required for this moderation action.',
  });
});

export const adminUserListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  role: z.enum(['APPLICANT', 'RECRUITER', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED']).optional(),
  ...pageFields,
}).strict();

export const adminUserParamsSchema = z.object({ userId: resourceId }).strict();

export const userStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
  reason: moderationReason,
}).strict().superRefine((input, context) => {
  if (input.status === 'SUSPENDED' && !input.reason) context.addIssue({
    code: 'custom', path: ['reason'], message: 'A reason is required when suspending a user.',
  });
});
