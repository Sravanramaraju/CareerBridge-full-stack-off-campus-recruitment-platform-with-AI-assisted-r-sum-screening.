import { describe, expect, it, vi } from 'vitest';
import {
  getApplicantApplication,
  getApplicantApplications,
  withdrawApplicantApplication,
} from '../src/modules/applications/applicantApplication.service.js';

const database = { marker: 'transaction-client' };
const now = new Date('2026-09-10T00:00:00.000Z');

const rawApplication = {
  id: 'application-1',
  applicantId: 'applicant-1',
  jobId: 'job-1',
  resumeId: 'resume-1',
  coverNote: null,
  status: 'APPLIED',
  appliedAt: new Date('2026-09-10'),
  updatedAt: new Date('2026-09-10'),
  job: {
    id: 'job-1', status: 'PUBLISHED', workMode: 'REMOTE', employmentType: 'FULL_TIME',
    experienceMin: 0, experienceMax: 0, salaryMin: null, salaryMax: null,
    currency: 'INR', hideSalary: false, publishedAt: new Date('2026-09-01'), skills: [],
    company: {
      name: 'Northstar Labs', brandInitials: 'NL', brandColor: '#2658d8',
      verificationStatus: 'VERIFIED',
    },
  },
  resume: {
    id: 'resume-1', originalFileName: 'resume.pdf', mimeType: 'application/pdf',
    fileSize: 1_024, parseStatus: 'READY', createdAt: new Date('2026-09-01'),
  },
  screeningAnswers: [],
  statusHistory: [],
};

describe('applicant application service', () => {
  it('returns presented applications owned by the current applicant', async () => {
    const listApplications = vi.fn().mockResolvedValue([rawApplication]);
    const result = await getApplicantApplications('applicant-1', { listApplications });
    expect(listApplications).toHaveBeenCalledWith('applicant-1');
    expect(result).toEqual([expect.objectContaining({ id: 'application-1', status: 'Applied' })]);
  });

  it('returns one presented owned application', async () => {
    const findApplication = vi.fn().mockResolvedValue(rawApplication);
    await expect(getApplicantApplication('applicant-1', 'application-1', { findApplication }))
      .resolves.toMatchObject({ id: 'application-1', resume: { name: 'resume.pdf' } });
    expect(findApplication).toHaveBeenCalledWith('application-1', 'applicant-1');
  });

  it('uses a generic not-found response for foreign applications', async () => {
    await expect(getApplicantApplication('applicant-1', 'foreign-application', {
      findApplication: vi.fn().mockResolvedValue(null),
    })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('withdraws an eligible application and notifies company recruiters atomically', async () => {
    const changed = {
      ...rawApplication,
      status: 'WITHDRAWN',
      statusHistory: [{
        id: 'history-1', previousStatus: 'APPLIED', newStatus: 'WITHDRAWN',
        reason: 'Application withdrawn by applicant.', createdAt: now,
      }],
    };
    const findApplication = vi.fn()
      .mockResolvedValueOnce(rawApplication)
      .mockResolvedValueOnce(changed);
    const updateStatus = vi.fn().mockResolvedValue({ count: 1 });
    const createHistory = vi.fn().mockResolvedValue({ id: 'history-1' });
    const createNotifications = vi.fn().mockResolvedValue({ count: 1 });

    await expect(withdrawApplicantApplication('applicant-1', 'application-1', {
      runTransaction: (operation) => operation(database),
      findApplication,
      updateStatus,
      createHistory,
      listRecruiters: vi.fn().mockResolvedValue([{ user: { id: 'recruiter-1' } }]),
      createNotifications,
    })).resolves.toMatchObject({ statusCode: 'WITHDRAWN', status: 'Withdrawn' });
    expect(updateStatus).toHaveBeenCalledWith(
      'application-1', 'applicant-1', 'APPLIED', 'WITHDRAWN', database,
    );
    expect(createHistory).toHaveBeenCalledWith(
      'application-1', 'APPLIED', 'WITHDRAWN', 'applicant-1',
      'Application withdrawn by applicant.', database,
    );
    expect(createNotifications).toHaveBeenCalledWith([expect.objectContaining({
      userId: 'recruiter-1', type: 'APPLICATION_STATUS_CHANGED', entityId: 'application-1',
    })], database);
  });

  it('keeps repeated withdrawal requests idempotent', async () => {
    const updateStatus = vi.fn();
    await withdrawApplicantApplication('applicant-1', 'application-1', {
      runTransaction: (operation) => operation(database),
      findApplication: vi.fn().mockResolvedValue({ ...rawApplication, status: 'WITHDRAWN' }),
      updateStatus,
    });
    expect(updateStatus).not.toHaveBeenCalled();
  });

  it('rejects withdrawal after an offer or final decision', async () => {
    await expect(withdrawApplicantApplication('applicant-1', 'application-1', {
      runTransaction: (operation) => operation(database),
      findApplication: vi.fn().mockResolvedValue({ ...rawApplication, status: 'OFFERED' }),
    })).rejects.toMatchObject({ code: 'INVALID_APPLICATION_TRANSITION', status: 409 });
  });

  it('detects concurrent applicant status changes before appending history', async () => {
    const createHistory = vi.fn();
    await expect(withdrawApplicantApplication('applicant-1', 'application-1', {
      runTransaction: (operation) => operation(database),
      findApplication: vi.fn().mockResolvedValue(rawApplication),
      updateStatus: vi.fn().mockResolvedValue({ count: 0 }),
      createHistory,
    })).rejects.toMatchObject({ code: 'APPLICATION_STATUS_CONFLICT', status: 409 });
    expect(createHistory).not.toHaveBeenCalled();
  });
});
