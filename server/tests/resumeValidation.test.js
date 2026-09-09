import { describe, expect, it, vi } from 'vitest';
import { MAX_RESUME_BYTES, validateResumeFile } from '../src/modules/resumes/resumeValidation.js';

function upload(overrides = {}) {
  return {
    originalname: 'resume.pdf',
    mimetype: 'application/pdf',
    size: 4,
    buffer: Buffer.from('%PDF'),
    ...overrides,
  };
}

describe('resume upload validation', () => {
  it('accepts PDF contents only after signature validation', async () => {
    const detectType = vi.fn().mockResolvedValue({ ext: 'pdf', mime: 'application/pdf' });

    await expect(validateResumeFile(upload(), { detectType })).resolves.toEqual({
      extension: '.pdf',
      mimeType: 'application/pdf',
      size: 4,
    });
    expect(detectType).toHaveBeenCalledWith(expect.any(Buffer));
  });

  it('accepts valid DOCX signatures even with a generic browser MIME', async () => {
    const mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    await expect(validateResumeFile(upload({
      originalname: 'resume.docx',
      mimetype: 'application/octet-stream',
    }), {
      detectType: vi.fn().mockResolvedValue({ ext: 'docx', mime: mimeType }),
    })).resolves.toMatchObject({ extension: '.docx', mimeType });
  });

  it('rejects unsupported extensions and signature mismatches', async () => {
    await expect(validateResumeFile(upload({ originalname: 'resume.doc' }))).rejects.toMatchObject({
      code: 'INVALID_RESUME_FILE',
      status: 422,
    });
    await expect(validateResumeFile(upload(), {
      detectType: vi.fn().mockResolvedValue({ ext: 'exe', mime: 'application/x-msdownload' }),
    })).rejects.toMatchObject({ code: 'INVALID_RESUME_FILE' });
  });

  it('rejects empty and oversized uploads', async () => {
    await expect(validateResumeFile(upload({ size: 0, buffer: Buffer.alloc(0) }))).rejects.toMatchObject({
      code: 'INVALID_RESUME_FILE',
    });
    await expect(validateResumeFile(upload({ size: MAX_RESUME_BYTES + 1 }))).rejects.toMatchObject({
      code: 'INVALID_RESUME_FILE',
    });
  });
});
