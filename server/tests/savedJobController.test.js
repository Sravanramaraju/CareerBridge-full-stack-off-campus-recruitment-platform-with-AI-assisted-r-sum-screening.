import { describe, expect, it, vi } from 'vitest';
import {
  createListSavedJobsHandler,
  createRemoveSavedJobHandler,
  createSaveJobHandler,
} from '../src/modules/savedJobs/savedJob.controller.js';

const request = {
  auth: { user: { id: 'applicant-1' } },
  validated: { params: { jobId: 'job-1' } },
};

describe('saved job controller', () => {
  it('lists saved jobs for the authenticated applicant', async () => {
    const listSavedJobs = vi.fn().mockResolvedValue([{ id: 'job-1' }]);
    const response = { json: vi.fn((body) => body) };
    await createListSavedJobsHandler({ listSavedJobs })(request, response, vi.fn());
    expect(listSavedJobs).toHaveBeenCalledWith('applicant-1');
    expect(response.json).toHaveBeenCalledWith({ data: [{ id: 'job-1' }] });
  });

  it('saves the validated job identifier for the authenticated applicant', async () => {
    const saveJob = vi.fn().mockResolvedValue({ jobId: 'job-1', saved: true });
    const response = { json: vi.fn((body) => body) };
    await createSaveJobHandler({ saveJob })(request, response, vi.fn());
    expect(saveJob).toHaveBeenCalledWith('applicant-1', 'job-1');
    expect(response.json).toHaveBeenCalledWith({
      data: { jobId: 'job-1', saved: true },
    });
  });

  it('removes the validated job identifier for the authenticated applicant', async () => {
    const removeSavedJob = vi.fn().mockResolvedValue({ jobId: 'job-1', saved: false });
    await createRemoveSavedJobHandler({ removeSavedJob })(
      request,
      { json: vi.fn() },
      vi.fn(),
    );
    expect(removeSavedJob).toHaveBeenCalledWith('applicant-1', 'job-1');
  });

  it('forwards saved-job failures to centralized error handling', async () => {
    const error = new Error('database unavailable');
    const next = vi.fn();
    await createSaveJobHandler({ saveJob: vi.fn().mockRejectedValue(error) })(
      request,
      { json: vi.fn() },
      next,
    );
    expect(next).toHaveBeenCalledWith(error);
  });
});
