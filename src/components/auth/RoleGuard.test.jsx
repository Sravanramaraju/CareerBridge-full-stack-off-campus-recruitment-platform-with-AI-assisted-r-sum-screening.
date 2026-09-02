import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { RoleGuard } from '@/src/components/auth/RoleGuard';
import { useAppStore } from '@/src/store/useAppStore';

function CurrentLocation() {
  const location = useLocation();
  return <p>{location.pathname}{location.search}</p>;
}

function renderGuard(route = '/applicant/dashboard') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="login" element={<CurrentLocation />} />
        <Route path="recruiter/dashboard" element={<CurrentLocation />} />
        <Route path="applicant/dashboard" element={<RoleGuard allowedRole="applicant"><h1>Applicant workspace</h1></RoleGuard>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RoleGuard', () => {
  beforeEach(() => useAppStore.setState({ session: null }));

  it('redirects signed-out visitors while preserving their destination', () => {
    renderGuard();
    expect(screen.getByText('/login?redirect=%2Fapplicant%2Fdashboard')).toBeInTheDocument();
  });

  it('redirects a signed-in user to their own role workspace', () => {
    useAppStore.setState({ session: { role: 'recruiter' } });
    renderGuard();
    expect(screen.getByText('/recruiter/dashboard')).toBeInTheDocument();
  });
});
