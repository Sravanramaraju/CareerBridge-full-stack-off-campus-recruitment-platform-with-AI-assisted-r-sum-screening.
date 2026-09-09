import { describe, expect, it } from 'vitest';
import { toPublicJob } from '../src/modules/jobs/job.presenter.js';

describe('public job presenter', () => {
  it('maps canonical enums, salary, experience, and skill requirements for the frontend', () => {
    const publishedAt = new Date('2026-09-01T00:00:00.000Z');
    const result = toPublicJob({
      id: 'job-1',
      workMode: 'ON_SITE',
      employmentType: 'FULL_TIME',
      experienceMin: 1,
      experienceMax: 2,
      salaryMin: { toString: () => '600000' },
      salaryMax: { toString: () => '800000' },
      currency: 'INR',
      hideSalary: false,
      publishedAt,
      skills: [
        { requirement: 'REQUIRED', skill: { name: 'JavaScript' } },
        { requirement: 'PREFERRED', skill: { name: 'React' } },
      ],
      company: {
        brandInitials: 'NL',
        brandColor: '#2658d8',
        verificationStatus: 'VERIFIED',
      },
    });

    expect(result).toMatchObject({
      workMode: 'On-site',
      employmentType: 'Full-time',
      experience: '1–2 years',
      salary: '₹6–8 LPA',
      skills: ['JavaScript', 'React'],
      requiredSkills: ['JavaScript'],
      preferredSkills: ['React'],
      postedAt: publishedAt,
      status: 'Published',
      company: { initials: 'NL', accent: '#2658d8', verified: true },
    });
  });

  it('does not expose hidden salary values', () => {
    const result = toPublicJob({
      workMode: 'REMOTE',
      employmentType: 'INTERNSHIP',
      experienceMin: 0,
      experienceMax: 0,
      salaryMin: 900_000,
      salaryMax: 1_200_000,
      currency: 'INR',
      hideSalary: true,
      publishedAt: new Date(),
      skills: [],
      company: {
        name: 'Orbit Learning',
        brandInitials: null,
        brandColor: null,
        verificationStatus: 'VERIFIED',
      },
    });

    expect(result).toMatchObject({
      workMode: 'Remote',
      employmentType: 'Internship',
      experience: 'Fresher',
      salary: 'Not disclosed',
      salaryMin: null,
      salaryMax: null,
      company: { initials: 'OL', accent: '#2658d8' },
    });
  });
});
