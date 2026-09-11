import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForgotPasswordPage } from '@/src/pages/auth/ForgotPasswordPage';
import { RoleSignupPage } from '@/src/pages/auth/RoleSignupPage';
import { useAppStore } from '@/src/store/useAppStore';

const authService = vi.hoisted(() => ({
  signupApplicant: vi.fn(),
  signupRecruiter: vi.fn(),
  forgotPassword: vi.fn(),
}));
vi.mock('@/src/services/authService', () => ({ authService }));

describe('connected authentication pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({ session: null, sessionStatus: 'anonymous' });
  });

  it('creates an applicant account through the backend service', async () => {
    const user = userEvent.setup();
    authService.signupApplicant.mockResolvedValue({
      id: 'applicant-1', role: 'applicant', name: 'Ananya Rao',
    });
    render(<MemoryRouter><RoleSignupPage accountType="applicant" /></MemoryRouter>);

    await user.type(screen.getByLabelText(/full name/i), 'Ananya Rao');
    await user.type(screen.getByLabelText(/email address/i), 'ananya@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(authService.signupApplicant).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'ananya@example.com', acceptedTerms: true }),
    ));
    expect(useAppStore.getState().session).toMatchObject({ id: 'applicant-1' });
  });

  it('submits password recovery without revealing account existence', async () => {
    const user = userEvent.setup();
    authService.forgotPassword.mockResolvedValue({ message: 'Request accepted.' });
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>);
    await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /send recovery link/i }));
    await waitFor(() => expect(authService.forgotPassword).toHaveBeenCalledWith(
      'user@example.com',
    ));
    expect(screen.getByRole('heading', { name: /check your inbox/i })).toBeInTheDocument();
  });
});
