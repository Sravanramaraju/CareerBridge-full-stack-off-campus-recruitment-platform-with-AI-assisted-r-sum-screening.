import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiClient = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }));
vi.mock('@/src/services/apiClient', () => ({ apiClient }));

import { adminService } from '@/src/services/adminService';

describe('adminService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads dashboard and filtered moderation queues', async () => {
    await adminService.getDashboard({ signal: 'dashboard' });
    await adminService.getCompanies({ status: 'PENDING', page: 2 });
    await adminService.getJobs({ moderationStatus: 'FLAGGED', q: 'engineer' });
    await adminService.getUsers({ role: 'RECRUITER', status: 'ACTIVE' });

    expect(apiClient.get).toHaveBeenNthCalledWith(1, '/admin/dashboard', { signal: 'dashboard' });
    expect(apiClient.get).toHaveBeenNthCalledWith(2, '/admin/companies?status=PENDING&page=2', undefined);
    expect(apiClient.get).toHaveBeenNthCalledWith(3, '/admin/jobs?moderationStatus=FLAGGED&q=engineer', undefined);
    expect(apiClient.get).toHaveBeenNthCalledWith(4, '/admin/users?role=RECRUITER&status=ACTIVE', undefined);
  });

  it('sends normalized moderation decisions to encoded resources', async () => {
    await adminService.updateCompanyVerification('company/1', 'NEEDS_CHANGES', ' Update evidence ');
    await adminService.updateJobModeration('job/1', 'FLAG', ' Misleading listing ');
    await adminService.updateUserStatus('user/1', 'SUSPENDED', ' Policy violation ');

    expect(apiClient.patch).toHaveBeenNthCalledWith(1, '/admin/companies/company%2F1/verification', { status: 'NEEDS_CHANGES', reason: 'Update evidence' }, undefined);
    expect(apiClient.patch).toHaveBeenNthCalledWith(2, '/admin/jobs/job%2F1/moderation', { action: 'FLAG', reason: 'Misleading listing' }, undefined);
    expect(apiClient.patch).toHaveBeenNthCalledWith(3, '/admin/users/user%2F1/status', { status: 'SUSPENDED', reason: 'Policy violation' }, undefined);
  });
});
