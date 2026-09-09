import { describe, expect, it } from 'vitest';
import {
  applicantCertificationCreateSchema,
  applicantCertificationUpdateSchema,
  applicantEducationCreateSchema,
  applicantEducationUpdateSchema,
  applicantExperienceCreateSchema,
  applicantExperienceUpdateSchema,
  applicantProfileUpdateSchema,
  applicantProjectCreateSchema,
  applicantProjectUpdateSchema,
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

describe('applicant experience request schemas', () => {
  it('coerces form dates and supplies create defaults', () => {
    const result = applicantExperienceCreateSchema.parse({
      title: 'Frontend Intern',
      organization: 'Northstar Labs',
      startDate: '2026-01-15',
      endDate: '2026-06-15',
    });

    expect(result).toMatchObject({
      title: 'Frontend Intern',
      organization: 'Northstar Labs',
      isCurrent: false,
      displayOrder: 0,
    });
    expect(result.startDate).toBeInstanceOf(Date);
  });

  it('rejects reversed experience dates and empty updates', () => {
    expect(
      applicantExperienceCreateSchema.safeParse({
        title: 'Frontend Intern',
        organization: 'Northstar Labs',
        startDate: '2026-06-15',
        endDate: '2026-01-15',
      }).success,
    ).toBe(false);
    expect(applicantExperienceUpdateSchema.safeParse({}).success).toBe(false);
  });
});

describe('applicant project request schemas', () => {
  it('validates project evidence and normalizes dates', () => {
    const result = applicantProjectCreateSchema.parse({
      name: 'CareerBridge',
      description: 'A full-stack recruitment platform for early-career applicants.',
      repositoryUrl: 'https://github.com/example/careerbridge',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      startedAt: '2026-01-01',
      completedAt: '2026-08-01',
    });

    expect(result.startedAt).toBeInstanceOf(Date);
    expect(result).toMatchObject({ displayOrder: 0, technologies: ['React', 'Node.js', 'PostgreSQL'] });
  });

  it('rejects invalid URLs, reversed dates, and empty updates', () => {
    expect(
      applicantProjectCreateSchema.safeParse({
        name: 'CareerBridge',
        description: 'A full-stack recruitment platform.',
        projectUrl: 'not-a-url',
      }).success,
    ).toBe(false);
    expect(
      applicantProjectCreateSchema.safeParse({
        name: 'CareerBridge',
        description: 'A full-stack recruitment platform.',
        startedAt: '2026-08-01',
        completedAt: '2026-01-01',
      }).success,
    ).toBe(false);
    expect(applicantProjectUpdateSchema.safeParse({}).success).toBe(false);
  });
});

describe('applicant certification request schemas', () => {
  it('normalizes certificate metadata and dates', () => {
    const result = applicantCertificationCreateSchema.parse({
      name: ' AWS Certified Cloud Practitioner ',
      issuer: ' Amazon Web Services ',
      issuedAt: '2026-01-15',
      expiresAt: '2029-01-15',
      credentialUrl: 'https://example.com/certificates/aws',
    });

    expect(result).toMatchObject({
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      displayOrder: 0,
    });
    expect(result.issuedAt).toBeInstanceOf(Date);
  });

  it('rejects invalid links, reversed dates, and empty updates', () => {
    expect(
      applicantCertificationCreateSchema.safeParse({
        name: 'Cloud Certificate',
        issuer: 'Training Provider',
        credentialUrl: 'not-a-url',
      }).success,
    ).toBe(false);
    expect(
      applicantCertificationCreateSchema.safeParse({
        name: 'Cloud Certificate',
        issuer: 'Training Provider',
        issuedAt: '2026-06-01',
        expiresAt: '2026-01-01',
      }).success,
    ).toBe(false);
    expect(applicantCertificationUpdateSchema.safeParse({}).success).toBe(false);
  });
});
