import { describe, expect, it, vi } from 'vitest';
import {
  createCertification,
  deleteCertification,
  updateCertification,
} from '../src/modules/profiles/profile.service.js';

describe('applicant certification service', () => {
  it('creates a certification for the authenticated applicant', async () => {
    const record = { id: 'certification-1', name: 'Cloud Practitioner' };
    const createRecord = vi.fn().mockResolvedValue(record);

    await expect(
      createCertification(
        'applicant-1',
        { name: 'Cloud Practitioner', issuer: 'Amazon Web Services' },
        { createRecord },
      ),
    ).resolves.toEqual(record);
    expect(createRecord).toHaveBeenCalledWith('applicant-1', {
      name: 'Cloud Practitioner',
      issuer: 'Amazon Web Services',
    });
  });

  it('updates an owned certification and returns its stored result', async () => {
    const database = { marker: 'transaction-client' };
    const current = {
      id: 'certification-1',
      issuedAt: new Date('2026-01-01'),
      expiresAt: null,
    };
    const saved = { ...current, credentialId: 'AWS-123' };
    const findRecord = vi.fn().mockResolvedValueOnce(current).mockResolvedValueOnce(saved);
    const updateRecord = vi.fn().mockResolvedValue({ count: 1 });

    const result = await updateCertification(
      'applicant-1',
      'certification-1',
      { credentialId: 'AWS-123' },
      {
        runTransaction: (operation) => operation(database),
        findRecord,
        updateRecord,
      },
    );

    expect(updateRecord).toHaveBeenCalledWith(
      'certification-1',
      'applicant-1',
      { credentialId: 'AWS-123' },
      database,
    );
    expect(result).toEqual(saved);
  });

  it('validates partial dates against the stored certification', async () => {
    const updateRecord = vi.fn();

    await expect(
      updateCertification(
        'applicant-1',
        'certification-1',
        { expiresAt: new Date('2025-12-01') },
        {
          runTransaction: (operation) => operation({}),
          findRecord: vi.fn().mockResolvedValue({
            issuedAt: new Date('2026-01-01'),
            expiresAt: null,
          }),
          updateRecord,
        },
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 422 });

    expect(updateRecord).not.toHaveBeenCalled();
  });

  it('returns the same not-found response for missing or foreign certifications', async () => {
    await expect(
      updateCertification('applicant-1', 'foreign-certification', { name: 'Changed' }, {
        runTransaction: (operation) => operation({}),
        findRecord: vi.fn().mockResolvedValue(null),
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('deletes only an owned certification record', async () => {
    await expect(
      deleteCertification('applicant-1', 'certification-1', {
        deleteRecord: vi.fn().mockResolvedValue({ count: 1 }),
      }),
    ).resolves.toEqual({ deleted: true });
  });
});
