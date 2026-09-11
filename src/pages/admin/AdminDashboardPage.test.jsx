import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/src/test/renderWithProviders';

const adminService = vi.hoisted(() => ({ getDashboard: vi.fn() }));
vi.mock('@/src/services/adminService', () => ({ adminService }));

import { AdminDashboardPage } from '@/src/pages/admin/AdminDashboardPage';

describe('AdminDashboardPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders real platform metrics and recent audit activity', async () => {
    adminService.getDashboard.mockResolvedValue({
      metrics: {
        totalUsers: 100, activeApplicants: 70, recruiters: 25, pendingCompanies: 5,
        publishedJobs: 30, flaggedJobs: 2, applications: 240,
      },
      recentModeration: [{
        id: 'audit-1', action: 'JOB_MODERATION_CHANGED', createdAt: '2026-09-10T00:00:00.000Z',
        actor: { name: 'Platform Admin' }, metadata: { from: 'PENDING', to: 'FLAGGED' },
      }],
    });
    renderWithProviders(<AdminDashboardPage />);

    expect(await screen.findByRole('heading', { name: 'Admin dashboard' })).toBeInTheDocument();
    expect(adminService.getDashboard).toHaveBeenCalledWith(expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('240')).toBeInTheDocument();
    expect(screen.getByText('Job moderation changed')).toBeInTheDocument();
    expect(screen.getByText('PENDING → FLAGGED')).toBeInTheDocument();
  });
});
