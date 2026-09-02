import { describe, expect, it } from 'vitest';
import { jobSchema } from '@/src/schemas/jobSchema';

const validJob = {
  title: 'Graduate Frontend Engineer', department: 'Engineering', category: 'Engineering', employmentType: 'Full-time', workMode: 'Hybrid', location: 'Bengaluru', openings: 2,
  experienceMin: 0, experienceMax: 1, salaryMin: 6, salaryMax: 8, hideSalary: false, qualification: "Bachelor's degree", requiredSkills: 'React, JavaScript', preferredSkills: 'Testing',
  description: 'Build accessible product interfaces with a supportive engineering team while learning through feedback and real customer problems.',
  responsibilities: 'Develop accessible interfaces, review changes, and collaborate with product partners.',
  deadline: '2026-09-30', contactVisible: true, screeningQuestions: 'Can you work in the listed location?',
};

describe('jobSchema', () => {
  it('blocks incomplete role basics before step progression', () => {
    const result = jobSchema.safeParse({ ...validJob, title: '', workMode: '', openings: 0 });
    expect(result.success).toBe(false);
    expect(result.error.issues.map((issue) => issue.path[0])).toEqual(expect.arrayContaining(['title', 'workMode', 'openings']));
  });

  it('rejects reversed experience and salary ranges', () => {
    const result = jobSchema.safeParse({ ...validJob, experienceMin: 3, experienceMax: 1, salaryMin: 10, salaryMax: 8 });
    expect(result.success).toBe(false);
    expect(result.error.issues.map((issue) => issue.path[0])).toEqual(expect.arrayContaining(['experienceMax', 'salaryMax']));
  });

  it('limits screening questions to five', () => {
    const result = jobSchema.safeParse({ ...validJob, screeningQuestions: 'One\nTwo\nThree\nFour\nFive\nSix' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual(['screeningQuestions']);
  });
});
