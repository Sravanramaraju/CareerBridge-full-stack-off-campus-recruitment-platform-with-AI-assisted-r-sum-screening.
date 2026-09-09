import { describe, expect, it, vi } from 'vitest';
import {
  createEducation,
  deleteEducation,
  updateEducation,
} from '../src/modules/profiles/profile.service.js';

describe('applicant education service', () => {
  it('creates education for the authenticated applicant', async () => {
    const record = { id: 'education-1', institution: 'University' };
    const createRecord = vi.fn().mockResolvedValue(record);

    await expect(
      createEducation('applicant-1', { institution: 'University' }, { createRecord }),
    ).resolves.toEqual(record);
    expect(createRecord).toHaveBeenCalledWith('applicant-1', { institution: 'University' });
  });

  it('updates an owned record and returns its persisted state', async () => {
    const database = { marker: 'transaction-client' };
    const current = { id: 'education-1', startYear: 2022, endYear: 2026 };
    const saved = { ...current, grade: 'A' };
    const findRecord = vi.fn().mockResolvedValueOnce(current).mockResolvedValueOnce(saved);
    const updateRecord = vi.fn().mockResolvedValue({ count: 1 });

    const result = await updateEducation('applicant-1', 'education-1', { grade: 'A' }, {
      runTransaction: (operation) => operation(database),
      findRecord,
      updateRecord,
    });

    expect(updateRecord).toHaveBeenCalledWith(
      'education-1',
      'applicant-1',
      { grade: 'A' },
      database,
    );
    expect(result).toEqual(saved);
  });

  it('validates partial date changes against the stored record', async () => {
    const updateRecord = vi.fn();

    await expect(
      updateEducation('applicant-1', 'education-1', { endYear: 2020 }, {
        runTransaction: (operation) => operation({}),
        findRecord: vi.fn().mockResolvedValue({ startYear: 2022, endYear: 2026 }),
        updateRecord,
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 422 });

    expect(updateRecord).not.toHaveBeenCalled();
  });

  it('does not reveal whether a missing education record belongs to another applicant', async () => {
    await expect(
      updateEducation('applicant-1', 'foreign-record', { grade: 'A' }, {
        runTransaction: (operation) => operation({}),
        findRecord: vi.fn().mockResolvedValue(null),
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('deletes only an owned education record', async () => {
    await expect(
      deleteEducation('applicant-1', 'education-1', {
        deleteRecord: vi.fn().mockResolvedValue({ count: 1 }),
      }),
    ).resolves.toEqual({ deleted: true });

    await expect(
      deleteEducation('applicant-1', 'foreign-record', {
        deleteRecord: vi.fn().mockResolvedValue({ count: 0 }),
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
