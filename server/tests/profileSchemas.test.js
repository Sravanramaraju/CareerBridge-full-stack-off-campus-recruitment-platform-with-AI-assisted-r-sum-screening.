import { describe, expect, it } from 'vitest';
import { applicantProfileUpdateSchema } from '../src/modules/profiles/profile.schemas.js';

describe('applicant profile request schemas', () => {
  it('normalizes basic profile and preference updates', () => {
    expect(
      applicantProfileUpdateSchema.parse({
        name: ' Ananya Rao ',
        headline: ' Frontend developer ',
        location: ' Bengaluru, Karnataka ',
        preferences: {
          locations: ['Bengaluru', 'Remote'],
          jobTypes: ['Full-time'],
          workModes: ['Hybrid'],
        },
      }),
    ).toEqual({
      name: 'Ananya Rao',
      headline: 'Frontend developer',
      location: 'Bengaluru, Karnataka',
      preferences: {
        locations: ['Bengaluru', 'Remote'],
        jobTypes: ['Full-time'],
        workModes: ['Hybrid'],
      },
    });
  });

  it('rejects empty updates and computed completion values', () => {
    expect(applicantProfileUpdateSchema.safeParse({}).success).toBe(false);
    expect(applicantProfileUpdateSchema.safeParse({ preferences: {} }).success).toBe(false);
    expect(applicantProfileUpdateSchema.safeParse({ profileCompletion: 100 }).success).toBe(false);
  });

  it('bounds user-entered lists and text', () => {
    expect(
      applicantProfileUpdateSchema.safeParse({
        preferences: { locations: Array.from({ length: 21 }, () => 'Remote') },
      }).success,
    ).toBe(false);
    expect(applicantProfileUpdateSchema.safeParse({ summary: 'x'.repeat(1_501) }).success).toBe(
      false,
    );
  });
});
