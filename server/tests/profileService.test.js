import { describe, expect, it, vi } from 'vitest';
import { getApplicantProfile } from '../src/modules/profiles/profile.service.js';

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
});
