import { describe, expect, it, vi } from 'vitest';
import {
  clearOwnedPrimaryResumes,
  createApplicantResume,
  findAccessibleResume,
  findNewestOwnedResume,
  findOwnedResume,
  findOwnedResumeMetadata,
  listApplicantResumes,
  updateOwnedResume,
} from '../src/modules/resumes/resume.repository.js';

describe('resume repository', () => {
  it('lists only active résumé metadata owned by the applicant', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await listApplicantResumes('applicant-1', { resume: { findMany } });

    const query = findMany.mock.calls[0][0];
    expect(query.where).toEqual({
      applicantProfile: { is: { userId: 'applicant-1' } },
      deletedAt: null,
    });
    expect(query.select).not.toHaveProperty('storageKey');
    expect(query.select).not.toHaveProperty('extractedText');
    expect(query.select.parsedData).toBe(true);
  });

  it('creates metadata through the authenticated applicant profile relation', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'resume-1' });
    const data = {
      originalFileName: 'Ananya_Resume.pdf',
      storageProvider: 'LOCAL',
      storageKey: 'resumes/2026/09/random.pdf',
      mimeType: 'application/pdf',
      fileSize: 1_024,
    };

    await createApplicantResume('applicant-1', data, { resume: { create } });

    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      data: { ...data, applicantProfile: { connect: { userId: 'applicant-1' } } },
    }));
  });

  it('scopes internal reads and updates by active applicant ownership', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const database = { resume: { findFirst, updateMany } };
    const ownership = {
      id: 'resume-1',
      deletedAt: null,
      applicantProfile: { is: { userId: 'applicant-1' } },
    };

    await findOwnedResume('resume-1', 'applicant-1', database);
    await updateOwnedResume('resume-1', 'applicant-1', { parseStatus: 'READY' }, database);
    await findOwnedResumeMetadata('resume-1', 'applicant-1', database);

    expect(findFirst).toHaveBeenNthCalledWith(1, { where: ownership });
    expect(updateMany).toHaveBeenCalledWith({
      where: ownership,
      data: { parseStatus: 'READY' },
    });
    expect(findFirst.mock.calls[1][0].select).not.toHaveProperty('storageKey');
  });

  it('clears primary state only across the authenticated applicant résumés', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    await clearOwnedPrimaryResumes('applicant-1', { resume: { updateMany } });

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        applicantProfile: { is: { userId: 'applicant-1' } },
        deletedAt: null,
        isPrimary: true,
      },
      data: { isPrimary: false },
    });
  });

  it('finds the newest active replacement résumé', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    await findNewestOwnedResume('applicant-1', { resume: { findFirst } });

    expect(findFirst).toHaveBeenCalledWith({
      where: { applicantProfile: { is: { userId: 'applicant-1' } }, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('allows applicants to access only their active résumé bytes', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    await findAccessibleResume('resume-1', 'applicant-1', 'APPLICANT', {
      resume: { findFirst },
    });

    expect(findFirst.mock.calls[0][0].where).toEqual({
      id: 'resume-1',
      applicantProfile: { is: { userId: 'applicant-1' } },
      deletedAt: null,
    });
  });

  it('requires a recruiter company application before accessing résumé bytes', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    await findAccessibleResume('resume-1', 'recruiter-1', 'RECRUITER', {
      resume: { findFirst },
    });

    expect(findFirst.mock.calls[0][0].where).toEqual({
      id: 'resume-1',
      applications: {
        some: {
          job: { company: { members: { some: { userId: 'recruiter-1' } } } },
        },
      },
    });
    expect(findFirst.mock.calls[0][0].select).toHaveProperty('storageKey', true);
  });
});
