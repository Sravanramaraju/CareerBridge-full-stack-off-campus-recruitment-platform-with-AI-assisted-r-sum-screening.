import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@/src/components/feedback/ToastProvider';
import { useAppStore } from '@/src/store/useAppStore';

const recruiterService = vi.hoisted(() => ({
  getApplication: vi.fn(),
  updateCandidateStatus: vi.fn(),
  getPrivateNotes: vi.fn(),
  addPrivateNote: vi.fn(),
  deletePrivateNote: vi.fn(),
}));

vi.mock('@/src/services/recruiterService', () => ({ recruiterService }));

import { CandidateDetailPage } from '@/src/pages/recruiter/CandidateDetailPage';

const candidate = {
  applicationId: 'application-1', jobId: 'job-1', name: 'Ananya Rao',
  headline: 'Frontend developer', location: 'Bengaluru', experience: '1 year',
  statusCode: 'UNDER_REVIEW', status: 'Under Review', match: 88,
  matchDetails: { experienceScore: 75 }, requiredCoverage: '80%', preferredCoverage: '100%',
  missing: ['PostgreSQL'], skills: ['React'], summary: 'Builds accessible applications.',
  education: [], experienceRecords: [], projects: [], certifications: [], screeningAnswers: [],
  history: [], notes: [],
  resume: {
    id: 'resume-1', name: 'ananya.pdf', fileSize: 2048, parseStatus: 'READY',
    createdAt: '2026-09-10T00:00:00.000Z', contentUrl: '/api/v1/resumes/resume-1/content',
  },
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    ...screen,
    view: (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/recruiter/candidates/application-1']}>
            <Routes><Route path="/recruiter/candidates/:applicationId" element={<CandidateDetailPage />} /></Routes>
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    ),
  };
}

async function mountPage() {
  const { render } = await import('@testing-library/react');
  const page = renderPage();
  render(page.view);
  await screen.findByRole('heading', { name: 'Ananya Rao' });
  return page;
}

describe('CandidateDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({ session: { id: 'recruiter-1', role: 'recruiter' } });
    recruiterService.getApplication.mockResolvedValue(candidate);
    recruiterService.getPrivateNotes.mockResolvedValue([]);
  });

  it('loads candidate evidence and sends a valid status transition with its reason', async () => {
    recruiterService.updateCandidateStatus.mockResolvedValue({
      ...candidate, statusCode: 'SHORTLISTED', status: 'Shortlisted',
    });
    await mountPage();

    expect(recruiterService.getApplication).toHaveBeenCalledWith('application-1', expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(screen.getByRole('link', { name: 'Open resume' })).toHaveAttribute('href', '/api/v1/resumes/resume-1/content');
    expect(screen.queryByRole('option', { name: 'Interview' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Move candidate to'), { target: { value: 'SHORTLISTED' } });
    fireEvent.change(screen.getByLabelText('Reason for status change'), { target: { value: ' Strong evidence ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update status' }));

    await waitFor(() => expect(recruiterService.updateCandidateStatus).toHaveBeenCalledWith(
      'application-1', 'SHORTLISTED', 'Strong evidence',
    ));
  });

  it('creates and deletes notes authored by the signed-in recruiter', async () => {
    const note = {
      id: 'note-1', note: 'Strong portfolio.', createdAt: '2026-09-10T00:00:00.000Z',
      author: { id: 'recruiter-1', name: 'Rhea' },
    };
    recruiterService.getPrivateNotes.mockResolvedValue([note]);
    recruiterService.addPrivateNote.mockResolvedValue({ ...note, id: 'note-2', note: 'Schedule follow-up.' });
    recruiterService.deletePrivateNote.mockResolvedValue({ noteId: 'note-1', deleted: true });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await mountPage();

    fireEvent.change(screen.getByLabelText('Private recruiter note'), { target: { value: ' Schedule follow-up. ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }));
    await waitFor(() => expect(recruiterService.addPrivateNote).toHaveBeenCalledWith('application-1', 'Schedule follow-up.'));

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete private note' }).at(-1));
    await waitFor(() => expect(recruiterService.deletePrivateNote).toHaveBeenCalledWith('note-1'));
  });
});
