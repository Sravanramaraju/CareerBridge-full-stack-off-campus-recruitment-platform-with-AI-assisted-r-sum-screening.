import { describe, expect, it } from 'vitest';
import {
  applicantSignupSchema,
  loginSchema,
  normalizedEmailSchema,
  recruiterSignupSchema,
} from '../src/modules/auth/auth.schemas.js';

describe('authentication validation', () => {
  it('normalizes email addresses before persistence or lookup', () => {
    expect(normalizedEmailSchema.parse('  Applicant@CareerBridge.Demo ')).toBe(
      'applicant@careerbridge.demo',
    );
  });

  it('defaults login sessions to non-persistent', () => {
    expect(
      loginSchema.parse({ email: 'user@example.com', password: 'password' }).rememberMe,
    ).toBe(false);
  });

  it('rejects malformed login input', () => {
    expect(
      loginSchema.safeParse({ email: 'not-an-email', password: '', rememberMe: 'yes' }).success,
    ).toBe(false);
  });

  it('requires explicit terms acceptance for applicant signup', () => {
    const result = applicantSignupSchema.safeParse({
      name: 'Ananya Rao',
      email: 'ananya@example.com',
      password: 'password',
      acceptedTerms: false,
    });

    expect(result.success).toBe(false);
  });

  it('requires a company name for recruiter signup', () => {
    const result = recruiterSignupSchema.safeParse({
      name: 'Rohan Mehta',
      companyName: ' ',
      email: 'rohan@example.com',
      password: 'password',
      acceptedTerms: true,
    });

    expect(result.success).toBe(false);
  });
});
