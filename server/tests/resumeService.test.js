import { describe, expect, it, vi } from 'vitest';
import {
  deleteApplicantResume,
  getApplicantResumes,
  setPrimaryResume,
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

  it('sets one owned résumé as primary inside a transaction', async () => {
    const database = { marker: 'transaction-client' };
    const clearPrimary = vi.fn().mockResolvedValue({ count: 1 });
    const updateResume = vi.fn().mockResolvedValue({ count: 1 });

    await expect(setPrimaryResume('applicant-1', 'resume-2', {
      runTransaction: (operation) => operation(database),
      findResume: vi.fn().mockResolvedValue({ id: 'resume-2' }),
      clearPrimary,
      updateResume,
      findMetadata: vi.fn().mockResolvedValue({ id: 'resume-2', isPrimary: true }),
    })).resolves.toMatchObject({ id: 'resume-2', isPrimary: true });

    expect(clearPrimary).toHaveBeenCalledWith('applicant-1', database);
    expect(updateResume).toHaveBeenCalledWith(
      'resume-2',
      'applicant-1',
      { isPrimary: true },
      database,
    );
  });

  it('soft deletes a résumé and promotes a replacement when needed', async () => {
    const deletedAt = new Date('2026-09-09T00:00:00.000Z');
    const database = { marker: 'transaction-client' };
    const updateResume = vi.fn().mockResolvedValue({ count: 1 });

    await expect(deleteApplicantResume('applicant-1', 'resume-1', {
      now: () => deletedAt,
      runTransaction: (operation) => operation(database),
      findResume: vi.fn().mockResolvedValue({ id: 'resume-1', isPrimary: true }),
      updateResume,
      findReplacement: vi.fn().mockResolvedValue({ id: 'resume-2' }),
    })).resolves.toEqual({ deleted: true });

    expect(updateResume).toHaveBeenNthCalledWith(
      1,
      'resume-1',
      'applicant-1',
      { deletedAt, isPrimary: false },
      database,
    );
    expect(updateResume).toHaveBeenNthCalledWith(
      2,
      'resume-2',
      'applicant-1',
      { isPrimary: true },
      database,
    );
  });

  it('uses a generic not-found response for foreign résumé identifiers', async () => {
    await expect(setPrimaryResume('applicant-1', 'foreign-resume', {
      runTransaction: (operation) => operation({}),
      findResume: vi.fn().mockResolvedValue(null),
    })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});
