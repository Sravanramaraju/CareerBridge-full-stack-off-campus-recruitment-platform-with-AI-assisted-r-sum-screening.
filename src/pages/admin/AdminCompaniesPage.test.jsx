import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/src/test/renderWithProviders';

const adminService = vi.hoisted(() => ({ getCompanies: vi.fn(), updateCompanyVerification: vi.fn() }));
vi.mock('@/src/services/adminService', () => ({ adminService }));

import { AdminCompaniesPage } from '@/src/pages/admin/AdminCompaniesPage';

const company = {
  id: 'company-1', name: 'Northstar Labs', industry: 'Developer tools', website: 'https://northstar.example',
  createdAt: '2026-09-01T00:00:00.000Z', verificationStatus: 'PENDING', verificationLabel: 'Pending',
  memberCount: 2, jobCount: 4,
};

describe('AdminCompaniesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.getCompanies.mockResolvedValue({ items: [company], pagination: { page: 1, totalPages: 1, total: 1 } });
  });

  it('loads the queue and submits a reasoned change request', async () => {
    adminService.updateCompanyVerification.mockResolvedValue({ ...company, verificationStatus: 'NEEDS_CHANGES', verificationLabel: 'Needs changes' });
    renderWithProviders(<AdminCompaniesPage />);
    expect(await screen.findByText('Northstar Labs')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Changes' }));
    fireEvent.change(screen.getByLabelText('Company moderation reason'), { target: { value: ' Add registration evidence ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm decision' }));

    await waitFor(() => expect(adminService.updateCompanyVerification).toHaveBeenCalledWith(
      'company-1', 'NEEDS_CHANGES', ' Add registration evidence ',
    ));
  });

  it('approves a company without manufacturing a moderation reason', async () => {
    adminService.updateCompanyVerification.mockResolvedValue({ ...company, verificationStatus: 'VERIFIED', verificationLabel: 'Verified' });
    renderWithProviders(<AdminCompaniesPage />);
    await screen.findByText('Northstar Labs');
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() => expect(adminService.updateCompanyVerification).toHaveBeenCalledWith('company-1', 'VERIFIED', undefined));
  });
});
