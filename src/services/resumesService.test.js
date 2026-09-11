import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiClient = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(),
}));
vi.mock('@/src/services/apiClient', () => ({ apiClient }));

import { resumesService } from '@/src/services/resumesService';

describe('resumesService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists applicant-owned resume metadata', async () => {
    await resumesService.getResumes({ signal: 'signal' });
    expect(apiClient.get).toHaveBeenCalledWith('/applicant/resumes', { signal: 'signal' });
  });

  it('uploads the resume using the backend multipart field', async () => {
    const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
    await resumesService.uploadResume(file);

    const [path, body] = apiClient.post.mock.calls[0];
    expect(path).toBe('/applicant/resumes');
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('resume')).toBe(file);
  });

  it('sets a primary resume and deletes through encoded resource paths', async () => {
    await resumesService.setPrimaryResume('resume/1');
    await resumesService.deleteResume('resume/1');

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/applicant/resumes/resume%2F1/primary', undefined, undefined,
    );
    expect(apiClient.delete).toHaveBeenCalledWith(
      '/applicant/resumes/resume%2F1', undefined,
    );
  });

  it('builds an encoded authenticated content URL', () => {
    expect(resumesService.contentUrl('resume/1')).toBe('/api/v1/resumes/resume%2F1/content');
  });
});
