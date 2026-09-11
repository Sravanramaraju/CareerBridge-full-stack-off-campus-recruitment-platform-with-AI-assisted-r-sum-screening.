import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiClient = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/src/services/apiClient', () => ({ apiClient }));

import { dashboardService } from '@/src/services/dashboardService';

describe('dashboardService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads role-specific dashboard summaries', async () => {
    await dashboardService.getApplicantDashboard({ signal: 'applicant' });
    await dashboardService.getRecruiterDashboard({ signal: 'recruiter' });

    expect(apiClient.get).toHaveBeenNthCalledWith(1, '/applicant/dashboard', { signal: 'applicant' });
    expect(apiClient.get).toHaveBeenNthCalledWith(2, '/recruiter/dashboard', { signal: 'recruiter' });
  });
});
