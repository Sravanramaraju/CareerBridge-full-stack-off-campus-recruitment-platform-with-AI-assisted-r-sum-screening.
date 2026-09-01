import { afterEach, describe, expect, it, vi } from 'vitest';
import { authService } from '@/src/services/mockApi';

describe('authService', () => {
  afterEach(() => vi.useRealTimers());

  async function settle(request) {
    vi.useFakeTimers();
    await vi.runAllTimersAsync();
    return request;
  }

  it('creates the matching demo applicant session', async () => {
    const session = await settle(authService.login('applicant@careerbridge.demo', 'demo1234'));

    expect(session).toMatchObject({
      email: 'applicant@careerbridge.demo',
      role: 'applicant',
      name: 'Ananya Rao',
    });
  });

  it('rejects invalid demo credentials', async () => {
    const request = authService.login('applicant@careerbridge.demo', 'wrong-password');
    vi.useFakeTimers();
    const assertion = expect(request).rejects.toThrow('Email or password is incorrect');
    await vi.runAllTimersAsync();
    await assertion;
  });
});
