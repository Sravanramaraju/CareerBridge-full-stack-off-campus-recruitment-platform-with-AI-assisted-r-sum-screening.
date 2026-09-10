import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient } from '@/src/services/apiClient';

afterEach(() => {
  vi.unstubAllGlobals();
  document.cookie = 'careerbridge_csrf=; Max-Age=0; path=/';
});

describe('api client', () => {
  it('sends credentialed JSON requests with the CSRF cookie', async () => {
    document.cookie = 'careerbridge_csrf=token%20123; path=/';
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: { saved: true },
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.patch('/settings', { theme: 'dark' })).resolves.toEqual({ saved: true });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/settings');
    expect(options.credentials).toBe('include');
    expect(options.headers.get('x-csrf-token')).toBe('token 123');
    expect(options.headers.get('content-type')).toBe('application/json');
    expect(options.body).toBe('{"theme":"dark"}');
  });

  it('leaves multipart content boundaries to the browser', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    const form = new FormData();
    form.set('resume', new Blob(['resume']), 'resume.pdf');

    await expect(apiClient.post('/applicant/resumes', form)).resolves.toBeNull();
    expect(fetchMock.mock.calls[0][1].headers.has('content-type')).toBe(false);
  });

  it('converts structured API failures into usable domain errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Review the highlighted fields.',
        fields: { email: 'Enter a valid email.' },
        requestId: 'request-1',
      },
    }), { status: 422, headers: { 'content-type': 'application/json' } })));

    const error = await apiClient.post('/auth/login', {}).catch((caught) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 422,
      code: 'VALIDATION_ERROR',
      fields: { email: 'Enter a valid email.' },
      requestId: 'request-1',
    });
  });

  it('converts connection failures while preserving cancellation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('offline'))
      .mockRejectedValueOnce(new DOMException('cancelled', 'AbortError')));
    await expect(apiClient.get('/jobs')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    await expect(apiClient.get('/jobs')).rejects.toMatchObject({ name: 'AbortError' });
  });
});
