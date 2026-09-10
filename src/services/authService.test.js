import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiClient = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/src/services/apiClient', () => ({ apiClient }));

import { authService } from '@/src/services/authService';

describe('auth service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('logs in through the API and normalizes the server role', async () => {
    apiClient.post.mockResolvedValue({
      user: { id: 'user-1', email: 'applicant@example.com', role: 'APPLICANT' },
      expiresAt: '2026-09-11T00:00:00.000Z',
    });
    await expect(authService.login({
      email: 'applicant@example.com', password: 'password', rememberMe: true,
    })).resolves.toMatchObject({ id: 'user-1', role: 'applicant' });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'applicant@example.com', password: 'password', rememberMe: true,
    }, undefined);
  });

  it('loads the current cookie-backed session', async () => {
    apiClient.get.mockResolvedValue({
      user: { id: 'recruiter-1', role: 'RECRUITER' }, expiresAt: 'later',
    });
    await expect(authService.getCurrentSession()).resolves.toMatchObject({
      id: 'recruiter-1', role: 'recruiter', expiresAt: 'later',
    });
  });

  it('removes client-only confirmation fields from signup payloads', async () => {
    apiClient.post.mockResolvedValue({ user: { id: 'user-1', role: 'RECRUITER' } });
    await authService.signupRecruiter({
      name: 'Rhea', companyName: 'Northstar', email: 'rhea@example.com',
      password: 'password', confirmPassword: 'password', acceptedTerms: true,
    });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/signup/recruiter', {
      name: 'Rhea', companyName: 'Northstar', email: 'rhea@example.com',
      password: 'password', acceptedTerms: true,
    }, undefined);
  });

  it('exposes logout and password recovery operations', async () => {
    apiClient.post.mockResolvedValue({ loggedOut: true });
    await authService.logout();
    await authService.forgotPassword('user@example.com');
    await authService.resetPassword({ token: 'token', password: 'new-password' });
    expect(apiClient.post).toHaveBeenNthCalledWith(1, '/auth/logout', undefined, undefined);
    expect(apiClient.post).toHaveBeenNthCalledWith(
      2, '/auth/forgot-password', { email: 'user@example.com' }, undefined,
    );
  });
});
