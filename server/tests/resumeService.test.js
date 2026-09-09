import { describe, expect, it, vi } from 'vitest';
import {
  getApplicantResumes,
  uploadApplicantResume,
} from '../src/modules/resumes/resume.service.js';

const file = {
  originalname: 'Ananya_Resume.pdf',
  buffer: Buffer.from('%PDF'),
};

function dependencies(overrides = {}) {
  return {
    validateFile: vi.fn().mockResolvedValue({
      extension: '.pdf',
      mimeType: 'application/pdf',
      size: 4,
    }),
    storage: {
      save: vi.fn().mockResolvedValue({
        storageProvider: 'local',
        storageKey: 'resumes/2026/09/random.pdf',
      }),
      delete: vi.fn().mockResolvedValue({ deleted: true }),
    },
    createResume: vi.fn().mockResolvedValue({ id: 'resume-1' }),
    updateResume: vi.fn().mockResolvedValue({ count: 1 }),
    findResume: vi.fn().mockResolvedValue({ id: 'resume-1', parseStatus: 'READY' }),
    extractText: vi.fn().mockResolvedValue('React developer'),
    extractData: vi.fn().mockReturnValue({ skills: [{ name: 'React' }], reviewRequired: true }),
    ...overrides,
  };
}

describe('resume service', () => {
  it('lists active résumés for the authenticated applicant', async () => {
    const listResumes = vi.fn().mockResolvedValue([{ id: 'resume-1' }]);
    await expect(getApplicantResumes('applicant-1', { listResumes }))
      .resolves.toEqual([{ id: 'resume-1' }]);
    expect(listResumes).toHaveBeenCalledWith('applicant-1');
  });

  it('stores, extracts, and persists reviewable résumé suggestions', async () => {
    const deps = dependencies();

    await expect(uploadApplicantResume('applicant-1', file, deps)).resolves.toMatchObject({
      id: 'resume-1',
      parseStatus: 'READY',
    });
    expect(deps.createResume).toHaveBeenCalledWith('applicant-1', expect.objectContaining({
      originalFileName: 'Ananya_Resume.pdf',
      storageProvider: 'LOCAL',
      parseStatus: 'PROCESSING',
    }));
    expect(deps.updateResume).toHaveBeenCalledWith('resume-1', 'applicant-1', {
      parseStatus: 'READY',
      extractedText: 'React developer',
      parsedData: { skills: [{ name: 'React' }], reviewRequired: true },
      parseError: null,
    });
  });

  it('removes orphaned bytes when metadata persistence fails', async () => {
    const deps = dependencies({ createResume: vi.fn().mockRejectedValue(new Error('database')) });

    await expect(uploadApplicantResume('applicant-1', file, deps)).rejects.toThrow('database');
    expect(deps.storage.delete).toHaveBeenCalledWith('resumes/2026/09/random.pdf');
  });

  it('keeps the uploaded file and records a safe parsing failure', async () => {
    const deps = dependencies({ extractText: vi.fn().mockRejectedValue(new Error('private detail')) });
    deps.findResume.mockResolvedValue({ id: 'resume-1', parseStatus: 'FAILED' });

    await expect(uploadApplicantResume('applicant-1', file, deps)).resolves.toMatchObject({
      parseStatus: 'FAILED',
    });
    expect(deps.updateResume).toHaveBeenCalledWith('resume-1', 'applicant-1', {
      parseStatus: 'FAILED',
      parseError: 'Text extraction failed. Upload a different PDF or DOCX file.',
    });
    expect(deps.storage.delete).not.toHaveBeenCalled();
  });
});
