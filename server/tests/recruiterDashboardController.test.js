import { describe, expect, it, vi } from 'vitest';
import { createGetRecruiterDashboardHandler } from '../src/modules/dashboard/recruiterDashboard.controller.js';

describe('recruiter dashboard controller', () => {
  it('loads the dashboard with authenticated recruiter identity', async () => {
    const data = { company: { id: 'company-1' } };
    const loadDashboard = vi.fn().mockResolvedValue(data);
    const response = { json: vi.fn((value) => value) };
    await createGetRecruiterDashboardHandler({ loadDashboard })(
      { auth: { user: { id: 'recruiter-1' } } }, response, vi.fn(),
    );
    expect(loadDashboard).toHaveBeenCalledWith('recruiter-1');
    expect(response.json).toHaveBeenCalledWith({ data });
  });
});
