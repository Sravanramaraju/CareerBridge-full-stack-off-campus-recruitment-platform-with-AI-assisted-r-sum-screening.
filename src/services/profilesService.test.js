import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiClient = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn(),
}));
vi.mock('@/src/services/apiClient', () => ({ apiClient }));

import { profilesService } from '@/src/services/profilesService';

describe('profilesService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads and updates the applicant profile', async () => {
    await profilesService.getApplicantProfile({ signal: 'signal' });
    await profilesService.updateApplicantProfile({ headline: 'Engineer' });

    expect(apiClient.get).toHaveBeenCalledWith('/applicant/profile', { signal: 'signal' });
    expect(apiClient.patch).toHaveBeenCalledWith(
      '/applicant/profile', { headline: 'Engineer' }, undefined,
    );
  });

  it('replaces skills as one idempotent account operation', async () => {
    const skills = [{ name: 'React', proficiency: 'ADVANCED' }];
    await profilesService.replaceSkills(skills);
    expect(apiClient.put).toHaveBeenCalledWith('/applicant/skills', { skills }, undefined);
  });

  it.each([
    ['education', 'education'],
    ['experience', 'experience'],
    ['projects', 'projects'],
    ['certifications', 'certifications'],
  ])('supports create, update, and delete for %s', async (serviceName, path) => {
    const service = profilesService[serviceName];
    await service.create({ name: 'Record' });
    await service.update('record/1', { name: 'Updated' });
    await service.remove('record/1');

    expect(apiClient.post).toHaveBeenCalledWith(`/applicant/${path}`, { name: 'Record' }, undefined);
    expect(apiClient.patch).toHaveBeenCalledWith(
      `/applicant/${path}/record%2F1`, { name: 'Updated' }, undefined,
    );
    expect(apiClient.delete).toHaveBeenCalledWith(`/applicant/${path}/record%2F1`, undefined);
  });
});
