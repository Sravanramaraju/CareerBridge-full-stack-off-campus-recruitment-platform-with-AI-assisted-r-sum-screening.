import { describe, expect, it, vi } from 'vitest';
import {
  createApplicantEducation,
  deleteOwnedApplicantEducation,
  findApplicantProfileByUserId,
  findOwnedApplicantEducation,
  updateApplicantProfileRecord,
  updateApplicantUserName,
  updateOwnedApplicantEducation,
} from '../src/modules/profiles/profile.repository.js';

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

  it('updates canonical user identity separately from profile details', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'applicant-1' });

    await updateApplicantUserName('applicant-1', 'Ananya Rao', { user: { update } });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'applicant-1' },
      data: { name: 'Ananya Rao' },
      select: { id: true },
    });
  });

  it('updates profile-owned fields and reloads safe profile evidence', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'profile-1' });
    const updates = { headline: 'Frontend developer', preferredLocations: ['Bengaluru'] };

    await updateApplicantProfileRecord('applicant-1', updates, {
      applicantProfile: { update },
    });

    expect(update).toHaveBeenCalledWith({
      where: { userId: 'applicant-1' },
      data: updates,
      select: expect.objectContaining({ user: expect.any(Object), resumes: expect.any(Object) }),
    });
  });

  it('creates education through the authenticated applicant profile relation', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'education-1' });
    const data = { institution: 'University', qualification: 'B.E.' };

    await createApplicantEducation('applicant-1', data, { applicantEducation: { create } });

    expect(create).toHaveBeenCalledWith({
      data: { ...data, applicantProfile: { connect: { userId: 'applicant-1' } } },
    });
  });

  it('scopes education reads, updates, and deletes by applicant ownership', async () => {
    const ownership = {
      id: 'education-1',
      applicantProfile: { is: { userId: 'applicant-1' } },
    };
    const findFirst = vi.fn().mockResolvedValue(null);
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const database = {
      applicantEducation: { findFirst, updateMany, deleteMany },
    };

    await findOwnedApplicantEducation('education-1', 'applicant-1', database);
    await updateOwnedApplicantEducation('education-1', 'applicant-1', { grade: 'A' }, database);
    await deleteOwnedApplicantEducation('education-1', 'applicant-1', database);

    expect(findFirst).toHaveBeenCalledWith({ where: ownership });
    expect(updateMany).toHaveBeenCalledWith({ where: ownership, data: { grade: 'A' } });
    expect(deleteMany).toHaveBeenCalledWith({ where: ownership });
  });
});
