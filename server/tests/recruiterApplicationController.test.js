import { describe, expect, it, vi } from 'vitest';
import {
  createGetRecruiterApplicationHandler,
  createListRecruiterApplicationsHandler,
  createUpdateRecruiterApplicationStatusHandler,
} from '../src/modules/applications/recruiterApplication.controller.js';

describe('recruiter application controller', () => {
  it('lists a validated owned job pipeline for the authenticated recruiter', async () => {
    const query = { minMatch: 80, page: 1, pageSize: 20 };
    const listApplications = vi.fn().mockResolvedValue({ items: [], pagination: {} });
    const response = { json: vi.fn((value) => value) };
    await createListRecruiterApplicationsHandler({ listApplications })(
      {
        auth: { user: { id: 'recruiter-1' } },
        validated: { params: { jobId: 'job-1' }, query },
      },
      response,
      vi.fn(),
    );
    expect(listApplications).toHaveBeenCalledWith('recruiter-1', 'job-1', query);
  });

  it('loads a validated application detail for the authenticated recruiter', async () => {
    const getApplication = vi.fn().mockResolvedValue({ applicationId: 'application-1' });
    const response = { json: vi.fn((value) => value) };
    await createGetRecruiterApplicationHandler({ getApplication })(
      {
        auth: { user: { id: 'recruiter-1' } },
        validated: { params: { applicationId: 'application-1' } },
      },
      response,
      vi.fn(),
    );
    expect(getApplication).toHaveBeenCalledWith('recruiter-1', 'application-1');
    expect(response.json).toHaveBeenCalledWith({ data: { applicationId: 'application-1' } });
  });

  it('forwards application errors to centralized error handling', async () => {
    const error = new Error('database unavailable');
    const next = vi.fn();
    await createGetRecruiterApplicationHandler({
      getApplication: vi.fn().mockRejectedValue(error),
    })(
      {
        auth: { user: { id: 'recruiter-1' } },
        validated: { params: { applicationId: 'application-1' } },
      },
      { json: vi.fn() },
      next,
    );
    expect(next).toHaveBeenCalledWith(error);
  });

  it('updates an application with validated status data and recruiter identity', async () => {
    const body = { status: 'INTERVIEW', reason: 'Interview scheduled.' };
    const updateStatus = vi.fn().mockResolvedValue({
      applicationId: 'application-1', status: 'Interview',
    });
    const response = { json: vi.fn((value) => value) };
    await createUpdateRecruiterApplicationStatusHandler({ updateStatus })(
      {
        auth: { user: { id: 'recruiter-1' } },
        validated: { params: { applicationId: 'application-1' }, body },
      },
      response,
      vi.fn(),
    );
    expect(updateStatus).toHaveBeenCalledWith('recruiter-1', 'application-1', body);
    expect(response.json).toHaveBeenCalledWith({
      data: { applicationId: 'application-1', status: 'Interview' },
    });
  });
});
