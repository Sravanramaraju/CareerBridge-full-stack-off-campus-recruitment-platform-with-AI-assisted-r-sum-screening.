import { describe, expect, it, vi } from 'vitest';
import {
  createApplicantApplication,
  findApplicantApplicationByJob,
  findOwnedApplicantApplication,
  listOwnedApplicantApplications,
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

  it('lists applicant-owned applications without selecting private recruiter notes', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await listOwnedApplicantApplications('applicant-1', { application: { findMany } });
    const query = findMany.mock.calls[0][0];
    expect(query.where).toEqual({ applicantId: 'applicant-1' });
    expect(query.orderBy).toEqual([{ updatedAt: 'desc' }, { id: 'desc' }]);
    expect(query.select).toHaveProperty('job');
    expect(query.select).toHaveProperty('resume');
    expect(query.select).toHaveProperty('statusHistory');
    expect(query.select).not.toHaveProperty('recruiterNotes');
  });

  it('scopes application detail reads to the authenticated applicant', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    await findOwnedApplicantApplication('application-1', 'applicant-1', {
      application: { findFirst },
    });
    expect(findFirst.mock.calls[0][0].where).toEqual({
      id: 'application-1',
      applicantId: 'applicant-1',
    });
    expect(findFirst.mock.calls[0][0].select).not.toHaveProperty('recruiterNotes');
  });
});
