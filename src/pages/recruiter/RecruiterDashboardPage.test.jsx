import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { dashboardService } from '@/src/services/dashboardService';
import { renderWithProviders } from '@/src/test/renderWithProviders';

vi.mock('@/src/services/dashboardService', () => ({
  dashboardService: { getRecruiterDashboard: vi.fn() },
}));

import { RecruiterDashboardPage } from '@/src/pages/recruiter/RecruiterDashboardPage';

const dashboard = {
  company: { id: 'company-1', name: 'Northstar Labs', verificationStatus: 'VERIFIED' },
  metrics: { activeJobs: 2, draftJobs: 1, newApplications: 3, shortlisted: 1, interviews: 1 },
  stageDistribution: { APPLIED: 2, UNDER_REVIEW: 1, SHORTLISTED: 1, INTERVIEW: 1, OFFERED: 0 },
  recentCandidates: [{
    applicationId: 'application-1', jobId: 'job-1', name: 'Ananya Rao',
    location: 'Bengaluru', match: 88, status: 'Under Review',
    job: { id: 'job-1', title: 'Frontend Engineer' },
  }],
  activeJobs: [{
    id: 'job-1', title: 'Frontend Engineer', department: 'Product', applicationCount: 5,
    deadline: '2026-10-01T00:00:00.000Z',
  }],
  attention: { draftJobs: 1, closingSoon: 2, awaitingInitialReview: 2 },
  notifications: { unreadCount: 4 },
};

describe('RecruiterDashboardPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders live recruiter metrics, candidates, jobs, and attention items', async () => {
    dashboardService.getRecruiterDashboard.mockResolvedValue(dashboard);
    renderWithProviders(<RecruiterDashboardPage />);

    expect(await screen.findByRole('heading', { name: 'Recruiting overview' })).toBeInTheDocument();
    expect(dashboardService.getRecruiterDashboard).toHaveBeenCalledWith(expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(screen.getByText('Ananya Rao')).toBeInTheDocument();
    expect(screen.getAllByText('Frontend Engineer')).toHaveLength(2);
    expect(screen.getByText('1 draft role needs completion.')).toBeInTheDocument();
    expect(screen.getByText('2 applicants are waiting for initial review.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View pipeline' })).toHaveAttribute('href', '/recruiter/jobs/job-1/applicants');
  });
});
