import { describe, expect, it } from 'vitest';
import { toApiJob, toFormJob } from '@/src/pages/recruiter/JobFormPage';

describe('recruiter job form transformations', () => {
  it('maps form labels, LPA, lists, and skills to the API contract', () => {
    const payload = toApiJob({
      title: ' Engineer ', department: 'Product', category: 'Engineering', location: 'Pune',
      workMode: 'Hybrid', employmentType: 'Full-time', openings: 2,
      experienceMin: 0, experienceMax: 2, salaryMin: 6, salaryMax: 9,
      currency: 'INR', hideSalary: false, description: 'A clear role description',
      responsibilities: 'Build features\nReview changes', qualification: 'Degree',
      contactVisible: true, deadline: '2026-10-01', requiredSkills: 'React, JavaScript',
      preferredSkills: 'Testing', screeningQuestions: 'Can you work hybrid?',
    });

    expect(payload).toMatchObject({
      title: 'Engineer', workMode: 'HYBRID', employmentType: 'FULL_TIME',
      salaryMin: 600000, salaryMax: 900000,
      responsibilities: ['Build features', 'Review changes'],
      skills: [
        { name: 'React', requirement: 'REQUIRED' },
        { name: 'JavaScript', requirement: 'REQUIRED' },
        { name: 'Testing', requirement: 'PREFERRED' },
      ],
    });
  });

  it('maps stored enums and rupees back into editable values', () => {
    const form = toFormJob({
      title: 'Engineer', employmentType: 'FULL_TIME', workMode: 'REMOTE',
      salaryMin: 500000, salaryMax: 800000, skills: [], responsibilities: [],
      screeningQuestions: [],
    });
    expect(form).toMatchObject({
      employmentType: 'Full-time', workMode: 'Remote', salaryMin: 5, salaryMax: 8,
    });
  });
});
