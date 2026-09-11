import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/src/test/renderWithProviders';

const adminService = vi.hoisted(() => ({ getJobs: vi.fn(), updateJobModeration: vi.fn() }));
vi.mock('@/src/services/adminService', () => ({ adminService }));

import { AdminJobsPage } from '@/src/pages/admin/AdminJobsPage';

const job = {
  id: 'job-1', title: 'Frontend Engineer', location: 'Bengaluru', status: 'PUBLISHED',
  statusLabel: 'Published', moderationStatus: 'PENDING', moderationLabel: 'Pending',
  company: { id: 'company-1', name: 'Northstar Labs' }, applicationCount: 5, savedCount: 8,
};

describe('AdminJobsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.getJobs.mockResolvedValue({ items: [job], pagination: { page: 1, totalPages: 1, total: 1 } });
  });

  it('submits a reasoned deactivation decision', async () => {
    adminService.updateJobModeration.mockResolvedValue({ ...job, moderationStatus: 'DEACTIVATED', moderationLabel: 'Deactivated' });
    renderWithProviders(<AdminJobsPage />);
    expect(await screen.findByText('Frontend Engineer')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate' }));
    fireEvent.change(screen.getByLabelText('Job moderation reason'), { target: { value: ' Misleading role details ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm decision' }));
    await waitFor(() => expect(adminService.updateJobModeration).toHaveBeenCalledWith('job-1', 'DEACTIVATE', ' Misleading role details '));
  });

  it('clears a job without requiring a reason', async () => {
    adminService.updateJobModeration.mockResolvedValue({ ...job, moderationStatus: 'CLEARED', moderationLabel: 'Cleared' });
    renderWithProviders(<AdminJobsPage />);
    await screen.findByText('Frontend Engineer');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    await waitFor(() => expect(adminService.updateJobModeration).toHaveBeenCalledWith('job-1', 'CLEAR', undefined));
  });
});
