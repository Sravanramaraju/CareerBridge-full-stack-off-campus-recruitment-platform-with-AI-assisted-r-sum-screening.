import { describe, expect, it, vi } from 'vitest';
import {
  getRecruiterApplication,
  getRecruiterJobApplications,
  updateRecruiterApplicationStatus,
} from '../src/modules/applications/recruiterApplication.service.js';

const membership = { company: { id: 'company-1' } };
const database = { marker: 'transaction-client' };
const now = new Date('2026-09-10T00:00:00.000Z');

function candidate(id, startDate) {
  return {
    id,
    jobId: 'job-1',
    resumeId: `resume-${id}`,
    status: 'APPLIED',
    appliedAt: now,
    updatedAt: now,
    applicant: {
      id: `applicant-${id}`,
      name: `Candidate ${id}`,
      email: `${id}@example.com`,
      applicantProfile: {
        headline: 'Engineer',
        location: 'Bengaluru',
        experiences: startDate ? [{ startDate, endDate: null, isCurrent: true }] : [],
        skills: [],
      },
    },
    match: { overallScore: 80 },
  };
}

describe('recruiter application service', () => {
  it('requires ownership before loading a candidate pipeline', async () => {
    await expect(getRecruiterJobApplications('recruiter-1', 'foreign-job', {
      minMatch: 0, page: 1, pageSize: 20,
    }, {
      findMembership: vi.fn().mockResolvedValue(membership),
      findJob: vi.fn().mockResolvedValue(null),
    })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('filters calculated experience and paginates the resulting candidates', async () => {
    const filters = {
      minMatch: 0,
      minExperienceMonths: 12,
      page: 1,
      pageSize: 1,
    };
    const result = await getRecruiterJobApplications('recruiter-1', 'job-1', filters, {
      findMembership: vi.fn().mockResolvedValue(membership),
      findJob: vi.fn().mockResolvedValue({ id: 'job-1', title: 'Engineer' }),
      listCandidates: vi.fn().mockResolvedValue([
        candidate('experienced', new Date('2024-09-10')),
        candidate('fresher'),
      ]),
      now: () => now,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ applicationId: 'experienced', experienceMonths: 24 });
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 1,
      total: 1,
      totalPages: 1,
    });
  });

  it('requires an authenticated recruiter company membership', async () => {
    await expect(getRecruiterJobApplications('recruiter-1', 'job-1', {
      minMatch: 0, page: 1, pageSize: 20,
    }, {
      findMembership: vi.fn().mockResolvedValue(null),
    })).rejects.toMatchObject({ code: 'COMPANY_MEMBERSHIP_REQUIRED', status: 403 });
  });

  it('returns complete application detail only through recruiter company ownership', async () => {
    const raw = candidate('detail', new Date('2025-09-10'));
    raw.coverNote = null;
    raw.job = { id: 'job-1', title: 'Engineer', company: { id: 'company-1' } };
    raw.resume = {
      id: 'resume-1', originalFileName: 'resume.pdf', mimeType: 'application/pdf',
      fileSize: 1_024, parseStatus: 'READY', createdAt: now,
    };
    raw.applicant.applicantProfile = {
      ...raw.applicant.applicantProfile,
      summary: 'Candidate summary',
      preferredLocations: [], preferredJobTypes: [], preferredWorkModes: [],
      applicantEducations: [], projects: [], certifications: [],
    };
    raw.screeningAnswers = [];
    raw.statusHistory = [];
    raw.recruiterNotes = [];
    const findApplication = vi.fn().mockResolvedValue(raw);

    await expect(getRecruiterApplication('recruiter-1', 'application-1', {
      findMembership: vi.fn().mockResolvedValue(membership),
      findApplication,
      now: () => now,
    })).resolves.toMatchObject({ applicationId: 'detail', summary: 'Candidate summary' });
    expect(findApplication).toHaveBeenCalledWith('application-1', 'company-1');
  });

  it('uses a generic not-found result for another company application', async () => {
    await expect(getRecruiterApplication('recruiter-1', 'foreign-application', {
      findMembership: vi.fn().mockResolvedValue(membership),
      findApplication: vi.fn().mockResolvedValue(null),
    })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('updates status, appends history, and notifies the applicant atomically', async () => {
    const current = candidate('detail', null);
    current.status = 'UNDER_REVIEW';
    current.job = { id: 'job-1', title: 'Engineer', company: { id: 'company-1' } };
    current.resume = {
      id: 'resume-1', originalFileName: 'resume.pdf', mimeType: 'application/pdf',
      fileSize: 1_024, parseStatus: 'READY', createdAt: now,
    };
    current.applicant.applicantProfile = {
      ...current.applicant.applicantProfile,
      summary: null, preferredLocations: [], preferredJobTypes: [], preferredWorkModes: [],
      applicantEducations: [], projects: [], certifications: [],
    };
    current.screeningAnswers = [];
    current.statusHistory = [];
    current.recruiterNotes = [];
    const changed = { ...current, status: 'SHORTLISTED' };
    const findApplication = vi.fn().mockResolvedValueOnce(current).mockResolvedValueOnce(changed);
    const updateStatus = vi.fn().mockResolvedValue({ count: 1 });
    const createHistory = vi.fn().mockResolvedValue({ id: 'history-1' });
    const createNotifications = vi.fn().mockResolvedValue({ count: 1 });
    const queueMessage = vi.fn().mockResolvedValue({ id: 'email-1' });

    await updateRecruiterApplicationStatus('recruiter-1', 'detail', {
      status: 'SHORTLISTED', reason: 'Portfolio meets the role requirements.',
    }, {
      runTransaction: (operation) => operation(database),
      findMembership: vi.fn().mockResolvedValue(membership),
      findApplication,
      updateStatus,
      createHistory,
      findApplicantAccount: vi.fn().mockResolvedValue({
        id: 'applicant-detail', name: 'Candidate', email: 'candidate@example.com',
        preference: { applicationUpdates: true },
      }),
      createNotifications,
      queueMessage,
      now: () => now,
    });

    expect(updateStatus).toHaveBeenCalledWith(
      'detail', 'company-1', 'UNDER_REVIEW', 'SHORTLISTED', database,
    );
    expect(createHistory).toHaveBeenCalledWith(
      'detail', 'UNDER_REVIEW', 'SHORTLISTED', 'recruiter-1',
      'Portfolio meets the role requirements.', database,
    );
    expect(createNotifications).toHaveBeenCalledWith([
      expect.objectContaining({
        userId: 'applicant-detail', type: 'APPLICATION_STATUS_CHANGED', entityId: 'detail',
      }),
    ], database);
    expect(queueMessage).toHaveBeenCalledWith(
      expect.objectContaining({ template: 'application-status-changed' }),
      database,
    );
  });

  it('does not create duplicate history for repeated status requests', async () => {
    const current = candidate('detail', null);
    current.status = 'INTERVIEW';
    current.job = { title: 'Engineer' };
    current.resume = {
      id: 'resume-1', originalFileName: 'resume.pdf', mimeType: 'application/pdf',
      fileSize: 1, parseStatus: 'READY', createdAt: now,
    };
    current.applicant.applicantProfile = {
      ...current.applicant.applicantProfile,
      summary: null, preferredLocations: [], preferredJobTypes: [], preferredWorkModes: [],
      applicantEducations: [], projects: [], certifications: [],
    };
    current.screeningAnswers = [];
    current.statusHistory = [];
    current.recruiterNotes = [];
    const updateStatus = vi.fn();
    await updateRecruiterApplicationStatus('recruiter-1', 'detail', { status: 'INTERVIEW' }, {
      runTransaction: (operation) => operation(database),
      findMembership: vi.fn().mockResolvedValue(membership),
      findApplication: vi.fn().mockResolvedValue(current),
      updateStatus,
      now: () => now,
    });
    expect(updateStatus).not.toHaveBeenCalled();
  });

  it('detects concurrent status changes before writing history', async () => {
    const current = candidate('detail', null);
    current.status = 'APPLIED';
    current.job = { title: 'Engineer' };
    const createHistory = vi.fn();
    await expect(updateRecruiterApplicationStatus('recruiter-1', 'detail', {
      status: 'UNDER_REVIEW',
    }, {
      runTransaction: (operation) => operation(database),
      findMembership: vi.fn().mockResolvedValue(membership),
      findApplication: vi.fn().mockResolvedValue(current),
      updateStatus: vi.fn().mockResolvedValue({ count: 0 }),
      createHistory,
    })).rejects.toMatchObject({ code: 'APPLICATION_STATUS_CONFLICT', status: 409 });
    expect(createHistory).not.toHaveBeenCalled();
  });
});
