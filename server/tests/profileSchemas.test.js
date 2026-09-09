import { describe, expect, it } from 'vitest';
import {
  applicantEducationCreateSchema,
  applicantEducationUpdateSchema,
  applicantProfileUpdateSchema,
  profileRecordParamsSchema,
} from '../src/modules/profiles/profile.schemas.js';

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

describe('applicant education request schemas', () => {
  it('validates a complete education record', () => {
    expect(
      applicantEducationCreateSchema.parse({
        institution: ' Visvesvaraya Technological University ',
        qualification: 'B.E. in Computer Science',
        startYear: 2022,
        endYear: 2026,
      }),
    ).toMatchObject({
      institution: 'Visvesvaraya Technological University',
      qualification: 'B.E. in Computer Science',
      isCurrent: false,
      displayOrder: 0,
    });
  });

  it('rejects reversed year ranges and empty updates', () => {
    expect(
      applicantEducationCreateSchema.safeParse({
        institution: 'University',
        qualification: 'Degree',
        startYear: 2026,
        endYear: 2022,
      }).success,
    ).toBe(false);
    expect(applicantEducationUpdateSchema.safeParse({}).success).toBe(false);
  });

  it('validates owned profile record identifiers', () => {
    expect(profileRecordParamsSchema.parse({ recordId: 'education-1' })).toEqual({
      recordId: 'education-1',
    });
    expect(profileRecordParamsSchema.safeParse({ recordId: '' }).success).toBe(false);
  });
});
