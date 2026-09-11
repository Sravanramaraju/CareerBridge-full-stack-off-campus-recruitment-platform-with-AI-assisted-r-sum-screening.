import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiClient = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(),
}));
vi.mock('@/src/services/apiClient', () => ({ apiClient }));

import { applicationsService } from '@/src/services/applicationsService';
import { savedJobsService } from '@/src/services/savedJobsService';

describe('applicant workflow services', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads applicant-owned applications and details', async () => {
    apiClient.get.mockResolvedValue([]);
    await applicationsService.getApplicantApplications();
    await applicationsService.getApplicantApplication('application/1');
    expect(apiClient.get).toHaveBeenNthCalledWith(1, '/applicant/applications', undefined);
    expect(apiClient.get).toHaveBeenNthCalledWith(
      2, '/applicant/applications/application%2F1', undefined,
    );
  });

  it('submits the selected resume and screening answers', async () => {
    apiClient.post.mockResolvedValue({ id: 'application-1' });
    await applicationsService.applyToJob({
      jobId: 'job-1',
      resumeId: 'resume-1',
      coverNote: '',
      screeningAnswers: [{ questionId: 'question-1', answer: 'Yes' }],
    });
    expect(apiClient.post).toHaveBeenCalledWith('/jobs/job-1/applications', {
      resumeId: 'resume-1',
      coverNote: null,
      screeningAnswers: [{ questionId: 'question-1', answer: 'Yes' }],
    }, undefined);
  });

  it('withdraws only through the applicant-owned endpoint', async () => {
    await applicationsService.withdrawApplication('application-1');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/applicant/applications/application-1/withdraw', undefined, undefined,
    );
  });

  it('lists, saves, and removes applicant-owned saved jobs', async () => {
    await savedJobsService.getSavedJobs();
    await savedJobsService.saveJob('job-1');
    await savedJobsService.removeJob('job-1');
    expect(apiClient.get).toHaveBeenCalledWith('/applicant/saved-jobs', undefined);
    expect(apiClient.put).toHaveBeenCalledWith(
      '/applicant/saved-jobs/job-1', undefined, undefined,
    );
    expect(apiClient.delete).toHaveBeenCalledWith(
      '/applicant/saved-jobs/job-1', undefined,
    );
  });
});
