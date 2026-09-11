import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/src/test/renderWithProviders';
import { useAppStore } from '@/src/store/useAppStore';

const adminService = vi.hoisted(() => ({ getUsers: vi.fn(), updateUserStatus: vi.fn() }));
vi.mock('@/src/services/adminService', () => ({ adminService }));

import { AdminUsersPage } from '@/src/pages/admin/AdminUsersPage';

const activeUser = {
  id: 'user-1', name: 'Ananya Rao', email: 'ananya@example.com', role: 'APPLICANT', roleLabel: 'Applicant',
  status: 'ACTIVE', statusLabel: 'Active', createdAt: '2026-09-01T00:00:00.000Z',
};
const suspendedUser = {
  ...activeUser, id: 'user-2', name: 'Rhea Shah', email: 'rhea@example.com', role: 'RECRUITER',
  roleLabel: 'Recruiter', status: 'SUSPENDED', statusLabel: 'Suspended',
};

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({ session: { id: 'admin-1', role: 'admin' } });
    adminService.getUsers.mockResolvedValue({ items: [activeUser, suspendedUser], pagination: { page: 1, totalPages: 1, total: 2 } });
  });

  it('suspends an account with an auditable reason', async () => {
    adminService.updateUserStatus.mockResolvedValue({ ...activeUser, status: 'SUSPENDED', statusLabel: 'Suspended' });
    renderWithProviders(<AdminUsersPage />);
    await screen.findByText('Ananya Rao');
    fireEvent.click(screen.getByRole('button', { name: 'Suspend' }));
    fireEvent.change(screen.getByLabelText('User suspension reason'), { target: { value: ' Repeated policy violations ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Suspend account' }));
    await waitFor(() => expect(adminService.updateUserStatus).toHaveBeenCalledWith('user-1', 'SUSPENDED', ' Repeated policy violations '));
  });

  it('reactivates a suspended account without requiring a reason', async () => {
    adminService.updateUserStatus.mockResolvedValue({ ...suspendedUser, status: 'ACTIVE', statusLabel: 'Active' });
    renderWithProviders(<AdminUsersPage />);
    await screen.findByText('Rhea Shah');
    fireEvent.click(screen.getByRole('button', { name: 'Reactivate' }));
    await waitFor(() => expect(adminService.updateUserStatus).toHaveBeenCalledWith('user-2', 'ACTIVE', undefined));
  });
});
