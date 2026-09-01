import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { JobSearchBar } from '@/src/components/jobs/JobSearchBar';

function SearchResult() {
  const location = useLocation();
  return <p data-testid="search-location">{location.pathname + location.search}</p>;
}

describe('JobSearchBar', () => {
  it('builds a jobs query from the submitted search fields', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<JobSearchBar />} />
          <Route path="/jobs" element={<SearchResult />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText('Role, skill or company'), 'React developer');
    await user.type(screen.getByPlaceholderText('City or remote'), 'Remote');
    await user.selectOptions(screen.getByLabelText('Experience'), '0–1 years');
    await user.click(screen.getByRole('button', { name: /search jobs/i }));

    const target = screen.getByTestId('search-location').textContent;
    expect(target).toContain('/jobs?');
    expect(target).toContain('q=React+developer');
    expect(target).toContain('location=Remote');
    expect(target).toContain('experience=0%E2%80%931+years');
  });
});
