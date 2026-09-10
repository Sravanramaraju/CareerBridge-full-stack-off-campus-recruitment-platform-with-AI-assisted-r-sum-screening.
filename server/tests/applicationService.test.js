import { describe, expect, it, vi } from 'vitest';
import { submitJobApplication } from '../src/modules/applications/application.service.js';

const database = { marker: 'transaction-client' };
const submittedAt = new Date('2026-09-10T12:00:00.000Z');
const job = {
  id: 'job-1',
  companyId: 'company-1',
  title: 'Graduate Engineer',
  company: { name: 'Northstar Labs' },
  screeningQuestions: [{
    id: 'question-1',
    question: 'Can you start in October?',
    required: true,
  }],
};
const profile = { user: { name: 'Ananya' } };
const application = { id: 'application-1', applicantId: 'applicant-1', status: 'APPLIED' };

function successfulDependencies(overrides = {}) {
  return {
    runTransaction: (operation) => operation(database),
    findJob: vi.fn().mockResolvedValue(job),
    findResume: vi.fn().mockResolvedValue({ id: 'resume-1' }),
    findDuplicate: vi.fn().mockResolvedValue(null),
    findProfile: vi.fn().mockResolvedValue(profile),
    createApplication: vi.fn().mockResolvedValue(application),
    getSemanticScore: vi.fn().mockResolvedValue(74),
    calculateMatch: vi.fn().mockReturnValue({ overallScore: 80 }),
    createMatch: vi.fn().mockResolvedValue({ id: 'match-1' }),
    findApplicantAccount: vi.fn().mockResolvedValue({
      id: 'applicant-1', name: 'Ananya', email: 'ananya@example.com',
      preference: { applicationUpdates: true },
    }),
    listRecruiterAccounts: vi.fn().mockResolvedValue([{
      user: {
        id: 'recruiter-1', name: 'Rhea', email: 'rhea@example.com',
        preference: { newApplications: true },
      },
    }]),
    createNotifications: vi.fn().mockResolvedValue({ count: 2 }),
    queueMessage: vi.fn().mockResolvedValue({ id: 'email-1' }),
    now: () => submittedAt,
    ...overrides,
  };
}

describe('application service', () => {
  it('creates a complete application workflow in one transaction', async () => {
    const dependencies = successfulDependencies();
    const input = {
      resumeId: 'resume-1',
      coverNote: 'Excited to contribute.',
      screeningAnswers: [{ questionId: 'question-1', answer: 'Yes' }],
    };

    await expect(submitJobApplication(
      'applicant-1', 'graduate-engineer', input, dependencies,
    )).resolves.toEqual(application);
    expect(dependencies.findJob).toHaveBeenCalledWith(
      'graduate-engineer', submittedAt, database,
    );
    expect(dependencies.createApplication).toHaveBeenCalledWith('applicant-1', 'job-1', {
      ...input,
      screeningAnswers: [{
        questionId: 'question-1',
        questionSnapshot: 'Can you start in October?',
        answer: 'Yes',
      }],
    }, database);
    expect(dependencies.getSemanticScore).toHaveBeenCalledWith(
      'job-1', 'resume-1', { database },
    );
    expect(dependencies.calculateMatch).toHaveBeenCalledWith(job, profile, {
      semanticScore: 74,
      now: submittedAt,
    });
    expect(dependencies.createMatch).toHaveBeenCalledWith(
      'application-1', { overallScore: 80 }, database,
    );
    expect(dependencies.createNotifications).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ userId: 'applicant-1', type: 'APPLICATION_SUBMITTED' }),
        expect.objectContaining({ userId: 'recruiter-1', type: 'APPLICATION_RECEIVED' }),
      ]),
      database,
    );
    expect(dependencies.queueMessage).toHaveBeenCalledTimes(2);
  });

  it('rejects duplicate applications before creating records', async () => {
    const dependencies = successfulDependencies({
      findDuplicate: vi.fn().mockResolvedValue({ id: 'application-existing' }),
    });
    await expect(submitJobApplication('applicant-1', 'job-1', {
      resumeId: 'resume-1', screeningAnswers: [{ questionId: 'question-1', answer: 'Yes' }],
    }, dependencies)).rejects.toMatchObject({ code: 'APPLICATION_EXISTS', status: 409 });
    expect(dependencies.createApplication).not.toHaveBeenCalled();
  });

  it('rejects resumes that do not belong to the applicant', async () => {
    const dependencies = successfulDependencies({ findResume: vi.fn().mockResolvedValue(null) });
    await expect(submitJobApplication('applicant-1', 'job-1', {
      resumeId: 'resume-foreign', screeningAnswers: [],
    }, dependencies)).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('rejects missing required and foreign screening answers', async () => {
    const dependencies = successfulDependencies();
    await expect(submitJobApplication('applicant-1', 'job-1', {
      resumeId: 'resume-1',
      screeningAnswers: [{ questionId: 'foreign-question', answer: 'Yes' }],
    }, dependencies)).rejects.toMatchObject({
      code: 'INVALID_SCREENING_ANSWERS',
      status: 422,
      fields: {
        'screeningAnswers.foreign-question': 'This question does not belong to the job.',
        'screeningAnswers.question-1': 'This screening question is required.',
      },
    });
  });

  it('respects persisted email preferences while keeping in-app notifications', async () => {
    const dependencies = successfulDependencies({
      findApplicantAccount: vi.fn().mockResolvedValue({
        id: 'applicant-1', email: 'ananya@example.com',
        preference: { applicationUpdates: false },
      }),
      listRecruiterAccounts: vi.fn().mockResolvedValue([{
        user: {
          id: 'recruiter-1', email: 'rhea@example.com',
          preference: { newApplications: false },
        },
      }]),
    });
    await submitJobApplication('applicant-1', 'job-1', {
      resumeId: 'resume-1',
      screeningAnswers: [{ questionId: 'question-1', answer: 'Yes' }],
    }, dependencies);
    expect(dependencies.createNotifications).toHaveBeenCalledOnce();
    expect(dependencies.queueMessage).not.toHaveBeenCalled();
  });

  it('stores a structured-only snapshot when semantic vectors are unavailable', async () => {
    const dependencies = successfulDependencies({
      getSemanticScore: vi.fn().mockResolvedValue(null),
    });
    await submitJobApplication('applicant-1', 'job-1', {
      resumeId: 'resume-1',
      screeningAnswers: [{ questionId: 'question-1', answer: 'Yes' }],
    }, dependencies);
    expect(dependencies.calculateMatch).toHaveBeenCalledWith(job, profile, {
      semanticScore: null,
      now: submittedAt,
    });
    expect(dependencies.createMatch).toHaveBeenCalledOnce();
  });
});
