import multer from 'multer';
import { describe, expect, it, vi } from 'vitest';
import { createResumeUploadMiddleware } from '../src/modules/resumes/resumeUpload.middleware.js';

describe('resume upload middleware', () => {
  it('continues after one valid multipart file', () => {
    const next = vi.fn();
    createResumeUploadMiddleware({
      uploadSingle: (_request, _response, callback) => callback(),
    })({}, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('translates upload size limits into a safe validation error', () => {
    const next = vi.fn();
    createResumeUploadMiddleware({
      uploadSingle: (_request, _response, callback) => callback(
        new multer.MulterError('LIMIT_FILE_SIZE'),
      ),
    })({}, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      code: 'INVALID_RESUME_FILE',
      status: 422,
    }));
  });

  it('forwards unexpected stream failures', () => {
    const error = new Error('stream failed');
    const next = vi.fn();
    createResumeUploadMiddleware({
      uploadSingle: (_request, _response, callback) => callback(error),
    })({}, {}, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
