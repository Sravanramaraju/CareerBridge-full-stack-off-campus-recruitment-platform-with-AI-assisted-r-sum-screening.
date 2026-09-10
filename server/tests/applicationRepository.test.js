import { describe, expect, it, vi } from 'vitest';
import {
  createApplicantApplication,
  findApplicantApplicationByJob,
} from '../src/modules/applications/application.repository.js';

describe('application repository', () => {
  it('finds duplicates through the applicant and job compound key', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    await findApplicantApplicationByJob('applicant-1', 'job-1', {
      application: { findUnique },
    });
    expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { applicantId_jobId: { applicantId: 'applicant-1', jobId: 'job-1' } },
    }));
  });

  it('creates the application, answer snapshots, and initial history together', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'application-1', status: 'APPLIED' });
    const screeningAnswers = [{
      questionId: 'question-1',
      questionSnapshot: 'Can you start in October?',
      answer: 'Yes',
    }];

    await createApplicantApplication('applicant-1', 'job-1', {
      resumeId: 'resume-1',
      coverNote: '',
      screeningAnswers,
    }, { application: { create } });

    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        applicantId: 'applicant-1',
        jobId: 'job-1',
        resumeId: 'resume-1',
        coverNote: null,
        status: 'APPLIED',
        screeningAnswers: {
          create: screeningAnswers,
        },
        statusHistory: {
          create: {
            previousStatus: null,
            newStatus: 'APPLIED',
            changedByUserId: 'applicant-1',
            reason: 'Application submitted.',
          },
        },
      },
    }));
  });
});
