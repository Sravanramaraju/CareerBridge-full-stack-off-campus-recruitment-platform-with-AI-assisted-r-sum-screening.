import { describe, expect, it } from 'vitest';
import {
  assertJobReadyForPublication,
  collectJobPublicationIssues,
} from '../src/modules/jobs/jobPublication.service.js';

const now = new Date('2026-09-09T12:00:00.000Z');
const completeJob = {
  title: 'Graduate Engineer',
  location: 'Bengaluru',
  workMode: 'HYBRID',
  employmentType: 'FULL_TIME',
  summary: 'Join our graduate engineering cohort.',
  description: 'Build customer-facing products with an experienced team.',
  responsibilities: ['Ship tested product improvements.'],
  qualification: 'Bachelor degree or equivalent practical experience.',
  deadline: new Date('2026-10-01T00:00:00.000Z'),
  skills: [{ requirement: 'REQUIRED', skill: { id: 'skill-1', name: 'JavaScript' } }],
  screeningQuestions: [],
};

describe('job publication readiness', () => {
  it('accepts a complete job with a future deadline and required skill', () => {
    expect(collectJobPublicationIssues(completeJob, now)).toEqual({});
    expect(() => assertJobReadyForPublication(completeJob, now)).not.toThrow();
  });

  it('reports every missing public field in one actionable response', () => {
    expect(collectJobPublicationIssues({
      title: ' ', responsibilities: [], skills: [], screeningQuestions: [],
    }, now)).toEqual({
      title: 'Title is required before publishing.',
      location: 'Location is required before publishing.',
      summary: 'Summary is required before publishing.',
      description: 'Description is required before publishing.',
      qualification: 'Qualification is required before publishing.',
      workMode: 'Work mode is required before publishing.',
      employmentType: 'Employment type is required before publishing.',
      responsibilities: 'Add at least one responsibility before publishing.',
      deadline: 'A valid application deadline is required before publishing.',
      skills: 'Add at least one required skill before publishing.',
    });
  });

  it('rejects expired deadlines and preferred-only skills', () => {
    expect(() => assertJobReadyForPublication({
      ...completeJob,
      deadline: now,
      skills: [{ requirement: 'PREFERRED', skill: { id: 'skill-1' } }],
    }, now)).toThrow(expect.objectContaining({
      code: 'JOB_NOT_READY',
      status: 422,
      fields: {
        deadline: 'The application deadline must be in the future.',
        skills: 'Add at least one required skill before publishing.',
      },
    }));
  });

  it('rejects persisted jobs that exceed the screening-question limit', () => {
    const screeningQuestions = Array.from({ length: 6 }, (_, index) => ({
      id: `question-${index}`,
      question: `Question ${index}`,
    }));
    expect(collectJobPublicationIssues({ ...completeJob, screeningQuestions }, now))
      .toMatchObject({ screeningQuestions: 'A job may have no more than five screening questions.' });
  });
});
