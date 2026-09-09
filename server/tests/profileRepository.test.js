import { describe, expect, it, vi } from 'vitest';
import { findApplicantProfileByUserId } from '../src/modules/profiles/profile.repository.js';

describe('applicant profile repository', () => {
  it('loads the authenticated applicant profile with ordered evidence', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);

    await findApplicantProfileByUserId('applicant-1', {
      applicantProfile: { findUnique },
    });

    const query = findUnique.mock.calls[0][0];
    expect(query.where).toEqual({ userId: 'applicant-1' });
    expect(query.select.user).toEqual({ select: { id: true, name: true, email: true } });
    expect(query.select.projects.orderBy).toEqual([
      { displayOrder: 'asc' },
      { createdAt: 'asc' },
    ]);
    expect(query.select.skills.select.skill.select).toMatchObject({ name: true });
  });

  it('selects safe active resume metadata without storage or parsed contents', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);

    await findApplicantProfileByUserId('applicant-1', {
      applicantProfile: { findUnique },
    });

    const resumes = findUnique.mock.calls[0][0].select.resumes;
    expect(resumes.where).toEqual({ deletedAt: null });
    expect(resumes.select).toMatchObject({
      id: true,
      originalFileName: true,
      mimeType: true,
      fileSize: true,
      parseStatus: true,
    });
    expect(resumes.select).not.toHaveProperty('storageKey');
    expect(resumes.select).not.toHaveProperty('extractedText');
    expect(resumes.select).not.toHaveProperty('parsedData');
  });
});
