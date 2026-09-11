import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/src/test/renderWithProviders';

const jobsService = vi.hoisted(() => ({ getJobs: vi.fn() }));
const companiesService = vi.hoisted(() => ({ getCompanies: vi.fn() }));
vi.mock('@/src/services/jobsService', () => ({ jobsService }));
vi.mock('@/src/services/companiesService', () => ({ companiesService }));
vi.mock('@/src/features/jobs/useSavedJobs', () => ({
  useSavedJobs: () => ({ savedJobIds: new Set(), toggleSavedJob: vi.fn() }),
}));

import { HomePage } from '@/src/pages/public/HomePage';

describe('HomePage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders current published jobs and verified companies', async () => {
    jobsService.getJobs.mockResolvedValue({ items: [{
      id: 'job-1', title: 'Frontend Engineer', summary: 'Build accessible products.', workMode: 'Hybrid',
      employmentType: 'Full-time', skills: ['React'], postedAt: '2026-09-10T00:00:00.000Z',
      company: { id: 'company-1', name: 'Northstar Labs', accent: '#3157c8', initials: 'NL' },
    }] });
    companiesService.getCompanies.mockResolvedValue({ items: [{
      id: 'company-1', name: 'Northstar Labs', industry: 'Developer tools', location: 'Bengaluru',
      openRoles: 1, accent: '#3157c8', initials: 'NL',
    }] });
    renderWithProviders(<HomePage />);

    expect(await screen.findByRole('link', { name: 'Frontend Engineer' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Northstar Labs' })).toBeInTheDocument();
    expect(jobsService.getJobs).toHaveBeenCalledWith({ page: 1, pageSize: 6 }, expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(companiesService.getCompanies).toHaveBeenCalledWith({ page: 1, pageSize: 4 }, expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });
});
