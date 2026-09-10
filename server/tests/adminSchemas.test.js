import { describe, expect, it } from 'vitest';
import {
  adminCompanyListQuerySchema,
  adminJobListQuerySchema,
  adminUserListQuerySchema,
  companyVerificationSchema,
  jobModerationSchema,
  userStatusSchema,
} from '../src/modules/admin/admin.schemas.js';

describe('admin schemas', () => {
  it.each([
    adminCompanyListQuerySchema,
    adminJobListQuerySchema,
    adminUserListQuerySchema,
  ])('applies bounded server pagination', (schema) => {
    expect(schema.parse({})).toMatchObject({ page: 1, pageSize: 20 });
    expect(schema.safeParse({ pageSize: '51' }).success).toBe(false);
  });

  it('requires explanations for adverse company verification outcomes', () => {
    expect(companyVerificationSchema.parse({ status: 'VERIFIED' }))
      .toEqual({ status: 'VERIFIED' });
    expect(companyVerificationSchema.safeParse({ status: 'REJECTED' }).success).toBe(false);
    expect(companyVerificationSchema.safeParse({
      status: 'NEEDS_CHANGES', reason: 'Add official registration details.',
    }).success).toBe(true);
  });

  it('requires explanations when flagging or deactivating a job', () => {
    expect(jobModerationSchema.parse({ action: 'CLEAR' })).toEqual({ action: 'CLEAR' });
    expect(jobModerationSchema.safeParse({ action: 'FLAG' }).success).toBe(false);
    expect(jobModerationSchema.safeParse({
      action: 'DEACTIVATE', reason: 'The listing is misleading.',
    }).success).toBe(true);
  });

  it('requires a reason for suspension while allowing reactivation', () => {
    expect(userStatusSchema.safeParse({ status: 'SUSPENDED' }).success).toBe(false);
    expect(userStatusSchema.parse({ status: 'ACTIVE' })).toEqual({ status: 'ACTIVE' });
  });
});
