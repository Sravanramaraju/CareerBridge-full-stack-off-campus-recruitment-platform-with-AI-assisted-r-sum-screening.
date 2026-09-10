import { describe, expect, it, vi } from 'vitest';
import { createSubmitApplicationHandler } from '../src/modules/applications/application.controller.js';

describe('application controller', () => {
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
});
