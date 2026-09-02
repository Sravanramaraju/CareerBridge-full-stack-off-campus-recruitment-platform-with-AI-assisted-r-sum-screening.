import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { JobCard } from '@/src/components/jobs/JobCard';
import { jobs } from '@/src/data/mockData';
import { renderWithProviders } from '@/src/test/renderWithProviders';

describe('JobCard', () => {
  const job = jobs[0];

  it('shows the core role metadata and limited skill summary', () => {
    renderWithProviders(<JobCard job={job} />);

    expect(screen.getByRole('link', { name: job.title })).toHaveAttribute('href', `/jobs/${job.id}`);
    expect(screen.getByText('Northstar Labs')).toBeInTheDocument();
    expect(screen.getByText(job.salary.replace('₹', ''))).toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('passes the job identifier to the save action', async () => {
    const onSave = vi.fn();
    renderWithProviders(<JobCard job={job} onSave={onSave} />);

    await userEvent.click(screen.getByRole('button', { name: `Save ${job.title}` }));

    expect(onSave).toHaveBeenCalledWith(job.id);
    expect(screen.getByText('Job saved.')).toBeInTheDocument();
  });
});
