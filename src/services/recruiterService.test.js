import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiClient = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(),
}));
vi.mock('@/src/services/apiClient', () => ({ apiClient }));

import { recruiterService } from '@/src/services/recruiterService';

describe('recruiterService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('manages the recruiter company and jobs', async () => {
    await recruiterService.getCompany();
    await recruiterService.updateCompany({ name: 'Company' });
    await recruiterService.getJobs();
    await recruiterService.createJob({ title: 'Engineer' });
    await recruiterService.updateJob('job/1', { title: 'Senior Engineer' });
    await recruiterService.publishJob('job/1');
    await recruiterService.closeJob('job/1');
    await recruiterService.reopenJob('job/1');
    await recruiterService.archiveJob('job/1');

    expect(apiClient.patch).toHaveBeenCalledWith('/recruiter/company', { name: 'Company' }, undefined);
    expect(apiClient.patch).toHaveBeenCalledWith('/recruiter/jobs/job%2F1', { title: 'Senior Engineer' }, undefined);
    expect(apiClient.post).toHaveBeenCalledWith('/recruiter/jobs/job%2F1/publish', undefined, undefined);
    expect(apiClient.delete).toHaveBeenCalledWith('/recruiter/jobs/job%2F1', undefined);
  });

  it('manages a filtered application pipeline and private notes', async () => {
    await recruiterService.getCandidates('job/1', { page: 2, minMatch: 70 });
    await recruiterService.getApplication('application/1');
    await recruiterService.updateCandidateStatus('application/1', 'INTERVIEW', ' Strong profile ');
    await recruiterService.getPrivateNotes('application/1');
    await recruiterService.addPrivateNote('application/1', 'Follow up');
    await recruiterService.deletePrivateNote('note/1');

    expect(apiClient.get).toHaveBeenCalledWith('/recruiter/jobs/job%2F1/applications?page=2&minMatch=70', undefined);
    expect(apiClient.patch).toHaveBeenCalledWith('/recruiter/applications/application%2F1/status', { status: 'INTERVIEW', reason: 'Strong profile' }, undefined);
    expect(apiClient.post).toHaveBeenCalledWith('/recruiter/applications/application%2F1/notes', { body: 'Follow up' }, undefined);
    expect(apiClient.delete).toHaveBeenCalledWith('/recruiter/notes/note%2F1', undefined);
  });
});
