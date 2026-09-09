import { describe, expect, it, vi } from 'vitest';
import {
  createGetJobHandler,
  createListCompanyJobsHandler,
  createListJobsHandler,
} from '../src/modules/jobs/job.controller.js';

describe('public job controller', () => {
  it('returns a validated public job collection', async () => {
    const query = { page: 1, pageSize: 12 };
    const result = { items: [], pagination: { page: 1, total: 0 } };
    const getJobs = vi.fn().mockResolvedValue(result);
    const response = { json: vi.fn((body) => body) };

    await createListJobsHandler({ getJobs })({ validated: { query } }, response, vi.fn());

    expect(getJobs).toHaveBeenCalledWith(query);
    expect(response.json).toHaveBeenCalledWith({ data: result });
  });

  it('scopes company job requests using the validated route identifier', async () => {
    const query = { page: 1, pageSize: 12 };
    const getJobs = vi.fn().mockResolvedValue({ items: [], pagination: {} });

    await createListCompanyJobsHandler({ getJobs })(
      {
        validated: {
          query,
          params: { companyId: 'northstar-labs' },
        },
      },
      { json: vi.fn() },
      vi.fn(),
    );

    expect(getJobs).toHaveBeenCalledWith(query, { companyIdentifier: 'northstar-labs' });
  });

  it('forwards repository failures to centralized error handling', async () => {
    const error = new Error('database unavailable');
    const next = vi.fn();

    await createListJobsHandler({ getJobs: vi.fn().mockRejectedValue(error) })(
      { validated: { query: {} } },
      { json: vi.fn() },
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });

  it('returns a job detail from validated route parameters', async () => {
    const job = { id: 'job-1', title: 'Frontend Engineer' };
    const getJob = vi.fn().mockResolvedValue(job);
    const response = { json: vi.fn((body) => body) };

    await createGetJobHandler({ getJob })(
      { validated: { params: { jobId: 'frontend-engineer' } } },
      response,
      vi.fn(),
    );

    expect(getJob).toHaveBeenCalledWith('frontend-engineer');
    expect(response.json).toHaveBeenCalledWith({ data: job });
  });
});
