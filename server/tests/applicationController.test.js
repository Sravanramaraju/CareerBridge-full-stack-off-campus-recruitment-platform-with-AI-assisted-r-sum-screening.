import { describe, expect, it, vi } from 'vitest';
import {
  createGetApplicantApplicationHandler,
  createListApplicantApplicationsHandler,
  createSubmitApplicationHandler,
  createWithdrawApplicantApplicationHandler,
} from '../src/modules/applications/application.controller.js';

describe('application controller', () => {
  it('lists applications using the authenticated applicant identity', async () => {
    const listApplications = vi.fn().mockResolvedValue([{ id: 'application-1' }]);
    const response = { json: vi.fn((value) => value) };
    await createListApplicantApplicationsHandler({ listApplications })(
      { auth: { user: { id: 'applicant-1' } } },
      response,
      vi.fn(),
    );
    expect(listApplications).toHaveBeenCalledWith('applicant-1');
    expect(response.json).toHaveBeenCalledWith({ data: [{ id: 'application-1' }] });
  });

  it('loads a validated applicant-owned application detail', async () => {
    const getApplication = vi.fn().mockResolvedValue({ id: 'application-1' });
    await createGetApplicantApplicationHandler({ getApplication })(
      {
        auth: { user: { id: 'applicant-1' } },
        validated: { params: { applicationId: 'application-1' } },
      },
      { json: vi.fn() },
      vi.fn(),
    );
    expect(getApplication).toHaveBeenCalledWith('applicant-1', 'application-1');
  });

  it('submits validated application data for the authenticated applicant', async () => {
    const body = { resumeId: 'resume-1', screeningAnswers: [] };
    const application = { id: 'application-1', status: 'APPLIED' };
    const submitApplication = vi.fn().mockResolvedValue(application);
    const response = { status: vi.fn(), json: vi.fn((value) => value) };
    response.status.mockReturnValue(response);

    await createSubmitApplicationHandler({ submitApplication })(
      {
        auth: { user: { id: 'applicant-1' } },
        validated: { params: { jobId: 'job-1' }, body },
      },
      response,
      vi.fn(),
    );

    expect(submitApplication).toHaveBeenCalledWith('applicant-1', 'job-1', body);
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ data: application });
  });

  it('forwards submission failures to centralized error handling', async () => {
    const error = new Error('database unavailable');
    const next = vi.fn();
    await createSubmitApplicationHandler({
      submitApplication: vi.fn().mockRejectedValue(error),
    })(
      {
        auth: { user: { id: 'applicant-1' } },
        validated: { params: { jobId: 'job-1' }, body: {} },
      },
      { status: vi.fn() },
      next,
    );
    expect(next).toHaveBeenCalledWith(error);
  });

  it('withdraws a validated application using the authenticated applicant identity', async () => {
    const application = { id: 'application-1', statusCode: 'WITHDRAWN' };
    const withdrawApplication = vi.fn().mockResolvedValue(application);
    const response = { json: vi.fn((value) => value) };

    await createWithdrawApplicantApplicationHandler({ withdrawApplication })(
      {
        auth: { user: { id: 'applicant-1' } },
        validated: { params: { applicationId: 'application-1' } },
      },
      response,
      vi.fn(),
    );

    expect(withdrawApplication).toHaveBeenCalledWith('applicant-1', 'application-1');
    expect(response.json).toHaveBeenCalledWith({ data: application });
  });

  it('forwards withdrawal failures to centralized error handling', async () => {
    const error = new Error('status conflict');
    const next = vi.fn();
    await createWithdrawApplicantApplicationHandler({
      withdrawApplication: vi.fn().mockRejectedValue(error),
    })(
      {
        auth: { user: { id: 'applicant-1' } },
        validated: { params: { applicationId: 'application-1' } },
      },
      { json: vi.fn() },
      next,
    );
    expect(next).toHaveBeenCalledWith(error);
  });
});
