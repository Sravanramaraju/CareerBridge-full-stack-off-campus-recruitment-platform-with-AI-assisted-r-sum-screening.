import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from '@/src/services/authService';
import { useAppStore } from '@/src/store/useAppStore';
import { ResetPasswordPage } from './ResetPasswordPage';

vi.mock('@/src/services/authService', () => ({
  authService: { resetPassword: vi.fn() },
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      session: { id: 'stale-session', role: 'applicant' },
      sessionStatus: 'authenticated',
    });
  });

  it('explains when the reset token is missing', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPasswordPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /reset link unavailable/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /request a new link/i }),
    ).toHaveAttribute('href', '/forgot-password');
  });

  it('validates matching passwords before calling the API', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/reset-password?token=valid-token']}>
        <ResetPasswordPage />
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText(/^new password/i), 'new-password');
    await user.type(
      screen.getByLabelText(/^confirm new password/i),
      'different-password',
    );
    await user.click(screen.getByRole('button', { name: /update password/i }));
    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument();
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  it('submits the token and password, clears stale session state, and confirms success', async () => {
    const user = userEvent.setup();
    authService.resetPassword.mockResolvedValue({ reset: true });
    render(
      <MemoryRouter initialEntries={['/reset-password?token=token-from-email']}>
        <ResetPasswordPage />
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText(/^new password/i), 'new-password');
    await user.type(
      screen.getByLabelText(/^confirm new password/i),
      'new-password',
    );
    await user.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() =>
      expect(authService.resetPassword).toHaveBeenCalledWith({
        token: 'token-from-email',
        password: 'new-password',
      }),
    );
    expect(useAppStore.getState()).toMatchObject({
      session: null,
      sessionStatus: 'anonymous',
    });
    expect(
      screen.getByRole('heading', { name: /password updated/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /return to login/i }),
    ).toHaveAttribute('href', '/login');
  });
});
