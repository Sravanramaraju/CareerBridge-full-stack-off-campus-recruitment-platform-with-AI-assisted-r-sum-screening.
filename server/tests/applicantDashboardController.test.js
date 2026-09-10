import { describe, expect, it, vi } from 'vitest';
import { createGetApplicantDashboardHandler } from '../src/modules/dashboard/applicantDashboard.controller.js';

describe('applicant dashboard controller', () => {
  it('loads the dashboard with authenticated applicant identity', async () => {
    const data = { user: { id: 'applicant-1' } };
    const loadDashboard = vi.fn().mockResolvedValue(data);
    const response = { json: vi.fn((value) => value) };
    await createGetApplicantDashboardHandler({ loadDashboard })(
      { auth: { user: { id: 'applicant-1' } } }, response, vi.fn(),
    );
    expect(loadDashboard).toHaveBeenCalledWith('applicant-1');
    expect(response.json).toHaveBeenCalledWith({ data });
  });
});
