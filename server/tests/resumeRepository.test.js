import { describe, expect, it, vi } from 'vitest';
import {
  createApplicantResume,
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
});
