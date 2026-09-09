import { describe, expect, it, vi } from 'vitest';
import {
  getApplicantProfile,
  updateApplicantProfile,
} from '../src/modules/profiles/profile.service.js';

function profileRecord() {
  return {
    id: 'profile-1',
    user: { name: 'Ananya Rao', email: 'ananya@example.com' },
    headline: null,
    phone: null,
    location: null,
    summary: null,
    preferredLocations: [],
    preferredJobTypes: [],
    preferredWorkModes: [],
    skills: [],
    applicantEducations: [],
    experiences: [],
    projects: [],
    certifications: [],
    resumes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('applicant profile service', () => {
  it('loads and presents the profile owned by the authenticated applicant', async () => {
    const findProfile = vi.fn().mockResolvedValue(profileRecord());

    const result = await getApplicantProfile('applicant-1', { findProfile });

    expect(findProfile).toHaveBeenCalledWith('applicant-1');
    expect(result).toMatchObject({ id: 'profile-1', name: 'Ananya Rao' });
  });

  it('returns a stable error when profile provisioning is missing', async () => {
    await expect(
      getApplicantProfile('applicant-1', { findProfile: vi.fn().mockResolvedValue(null) }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('updates user identity and profile preferences in one transaction', async () => {
    const database = { marker: 'transaction-client' };
    const updateName = vi.fn().mockResolvedValue({ id: 'applicant-1' });
    const updateProfile = vi.fn().mockResolvedValue(profileRecord());

    const result = await updateApplicantProfile(
      'applicant-1',
      {
        name: 'Ananya Rao',
        headline: 'Frontend developer',
        preferences: { locations: ['Bengaluru'], workModes: ['Hybrid'] },
      },
      {
        runTransaction: (operation) => operation(database),
        updateName,
        updateProfile,
      },
    );

    expect(updateName).toHaveBeenCalledWith('applicant-1', 'Ananya Rao', database);
    expect(updateProfile).toHaveBeenCalledWith(
      'applicant-1',
      {
        headline: 'Frontend developer',
        preferredLocations: ['Bengaluru'],
        preferredWorkModes: ['Hybrid'],
      },
      database,
    );
    expect(result.id).toBe('profile-1');
  });

  it('reloads profile evidence after a name-only update', async () => {
    const findProfile = vi.fn().mockResolvedValue(profileRecord());
    const updateProfile = vi.fn();

    await updateApplicantProfile(
      'applicant-1',
      { name: 'Ananya Rao' },
      {
        runTransaction: (operation) => operation({}),
        findProfile,
        updateName: vi.fn().mockResolvedValue({ id: 'applicant-1' }),
        updateProfile,
      },
    );

    expect(findProfile).toHaveBeenCalled();
    expect(updateProfile).not.toHaveBeenCalled();
  });
});
