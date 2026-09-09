import { describe, expect, it, vi } from 'vitest';
import {
  createDeleteResumeHandler,
  createGetResumeContentHandler,
  createListResumesHandler,
  createSetPrimaryResumeHandler,
  createUploadResumeHandler,
} from '../src/modules/resumes/resume.controller.js';

describe('resume controller', () => {
  it('lists the authenticated applicant résumés', async () => {
    const listResumes = vi.fn().mockResolvedValue([{ id: 'resume-1' }]);
    const response = { json: vi.fn() };
    await createListResumesHandler({ listResumes })(
      { auth: { user: { id: 'applicant-1' } } }, response, vi.fn(),
    );
    expect(listResumes).toHaveBeenCalledWith('applicant-1');
    expect(response.json).toHaveBeenCalledWith({ data: [{ id: 'resume-1' }] });
  });

  it('uploads multipart bytes for the authenticated applicant', async () => {
    const file = { originalname: 'resume.pdf', buffer: Buffer.from('%PDF') };
    const uploadResume = vi.fn().mockResolvedValue({ id: 'resume-1' });
    const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await createUploadResumeHandler({ uploadResume })(
      { auth: { user: { id: 'applicant-1' } }, file }, response, vi.fn(),
    );
    expect(uploadResume).toHaveBeenCalledWith('applicant-1', file);
    expect(response.status).toHaveBeenCalledWith(201);
  });

  it('sets and deletes owned résumé identifiers', async () => {
    const setPrimary = vi.fn().mockResolvedValue({ id: 'resume-1', isPrimary: true });
    const deleteResume = vi.fn().mockResolvedValue({ deleted: true });
    const request = {
      auth: { user: { id: 'applicant-1' } },
      validated: { params: { resumeId: 'resume-1' } },
    };
    await createSetPrimaryResumeHandler({ setPrimary })(request, { json: vi.fn() }, vi.fn());
    await createDeleteResumeHandler({ deleteResume })(request, { json: vi.fn() }, vi.fn());
    expect(setPrimary).toHaveBeenCalledWith('applicant-1', 'resume-1');
    expect(deleteResume).toHaveBeenCalledWith('applicant-1', 'resume-1');
  });

  it('streams authorized résumé bytes with private response headers', async () => {
    const buffer = Buffer.from('%PDF');
    const readContent = vi.fn().mockResolvedValue({
      buffer,
      fileName: 'Ananya Resume.pdf',
      mimeType: 'application/pdf',
      fileSize: 4,
    });
    const response = { set: vi.fn(), send: vi.fn() };

    await createGetResumeContentHandler({ readContent })(
      {
        auth: { user: { id: 'recruiter-1', role: 'RECRUITER' } },
        validated: { params: { resumeId: 'resume-1' } },
      },
      response,
      vi.fn(),
    );

    expect(readContent).toHaveBeenCalledWith('recruiter-1', 'RECRUITER', 'resume-1');
    expect(response.set).toHaveBeenCalledWith(expect.objectContaining({
      'Content-Type': 'application/pdf',
      'Cache-Control': 'private, no-store',
      'Content-Disposition': "inline; filename*=UTF-8''Ananya%20Resume.pdf",
    }));
    expect(response.send).toHaveBeenCalledWith(buffer);
  });
});
