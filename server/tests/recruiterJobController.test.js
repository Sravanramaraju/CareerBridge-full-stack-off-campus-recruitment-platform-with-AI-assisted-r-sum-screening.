import { describe, expect, it, vi } from 'vitest';
import {
  createArchiveRecruiterJobHandler,
  createCloseRecruiterJobHandler,
  createCreateRecruiterJobHandler,
  createGetRecruiterJobHandler,
  createListRecruiterJobsHandler,
  createPublishRecruiterJobHandler,
  createReopenRecruiterJobHandler,
  createUpdateRecruiterJobHandler,
} from '../src/modules/jobs/recruiterJob.controller.js';

const request = {
  auth: { user: { id: 'recruiter-1' } },
  validated: { params: { jobId: 'job-1' }, body: { title: 'Graduate Engineer' } },
};

function responseDouble() {
  const response = { json: vi.fn((body) => body), status: vi.fn() };
  response.status.mockReturnValue(response);
  return response;
}

describe('recruiter job controller', () => {
  it('lists jobs using the authenticated recruiter identity', async () => {
    const listJobs = vi.fn().mockResolvedValue([{ id: 'job-1' }]);
    const response = responseDouble();
    await createListRecruiterJobsHandler({ listJobs })(request, response, vi.fn());
    expect(listJobs).toHaveBeenCalledWith('recruiter-1');
    expect(response.json).toHaveBeenCalledWith({ data: [{ id: 'job-1' }] });
  });

  it('loads an owned job using validated parameters', async () => {
    const getJob = vi.fn().mockResolvedValue({ id: 'job-1' });
    await createGetRecruiterJobHandler({ getJob })(request, responseDouble(), vi.fn());
    expect(getJob).toHaveBeenCalledWith('recruiter-1', 'job-1');
  });

  it('creates a validated draft and returns created status', async () => {
    const createJob = vi.fn().mockResolvedValue({ id: 'job-1', status: 'DRAFT' });
    const response = responseDouble();
    await createCreateRecruiterJobHandler({ createJob })(request, response, vi.fn());
    expect(createJob).toHaveBeenCalledWith('recruiter-1', request.validated.body);
    expect(response.status).toHaveBeenCalledWith(201);
  });

  it('updates only validated body fields for the owned job', async () => {
    const updateJob = vi.fn().mockResolvedValue({ id: 'job-1' });
    await createUpdateRecruiterJobHandler({ updateJob })(request, responseDouble(), vi.fn());
    expect(updateJob).toHaveBeenCalledWith(
      'recruiter-1',
      'job-1',
      request.validated.body,
    );
  });

  it.each([
    ['publish', createPublishRecruiterJobHandler],
    ['close', createCloseRecruiterJobHandler],
    ['reopen', createReopenRecruiterJobHandler],
    ['archive', createArchiveRecruiterJobHandler],
  ])('passes authenticated ownership to the %s lifecycle action', async (_name, factory) => {
    const changeJob = vi.fn().mockResolvedValue({ id: 'job-1' });
    const response = responseDouble();
    await factory({ changeJob })(request, response, vi.fn());
    expect(changeJob).toHaveBeenCalledWith('recruiter-1', 'job-1');
    expect(response.json).toHaveBeenCalledWith({ data: { id: 'job-1' } });
  });

  it('forwards service errors to centralized error handling', async () => {
    const error = new Error('database unavailable');
    const next = vi.fn();
    await createGetRecruiterJobHandler({ getJob: vi.fn().mockRejectedValue(error) })(
      request,
      responseDouble(),
      next,
    );
    expect(next).toHaveBeenCalledWith(error);
  });
});
