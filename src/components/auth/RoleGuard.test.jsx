import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { RoleGuard } from '@/src/components/auth/RoleGuard';
import { useAppStore } from '@/src/store/useAppStore';

function CurrentPath() {
  const location = useLocation();
  return <p>{location.pathname + location.search}</p>;
}

function renderGuard(initialPath = '/applicant/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={<CurrentPath />} />
        <Route
          path="/applicant/dashboard"
          element={<RoleGuard allowedRole="applicant"><p>Applicant workspace</p></RoleGuard>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RoleGuard', () => {
  beforeEach(() => useAppStore.setState({ session: null }));

  it('redirects signed-out visitors back through login', () => {
    renderGuard();
    expect(screen.getByText('/login?redirect=%2Fapplicant%2Fdashboard')).toBeInTheDocument();
  });

  it('redirects a mismatched role to its own dashboard', () => {
    useAppStore.setState({ session: { role: 'recruiter' } });
    renderGuard();
    expect(screen.getByText('/recruiter/dashboard')).toBeInTheDocument();
  });

  it('renders the protected workspace for the allowed role', () => {
    useAppStore.setState({ session: { role: 'applicant' } });
    renderGuard();
    expect(screen.getByText('Applicant workspace')).toBeInTheDocument();
  });
});
