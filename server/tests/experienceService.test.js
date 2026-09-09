import { describe, expect, it, vi } from 'vitest';
import {
  createExperience,
  deleteExperience,
  updateExperience,
} from '../src/modules/profiles/profile.service.js';

describe('applicant experience service', () => {
  it('creates experience for the authenticated applicant', async () => {
    const record = { id: 'experience-1', title: 'Frontend Intern' };
    const createRecord = vi.fn().mockResolvedValue(record);

    await expect(
      createExperience('applicant-1', { title: 'Frontend Intern' }, { createRecord }),
    ).resolves.toEqual(record);
    expect(createRecord).toHaveBeenCalledWith('applicant-1', { title: 'Frontend Intern' });
  });

  it('updates owned experience and returns the stored result', async () => {
    const database = { marker: 'transaction-client' };
    const current = {
      id: 'experience-1',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-06-01'),
    };
    const saved = { ...current, title: 'Frontend Engineer' };
    const findRecord = vi.fn().mockResolvedValueOnce(current).mockResolvedValueOnce(saved);
    const updateRecord = vi.fn().mockResolvedValue({ count: 1 });

    const result = await updateExperience(
      'applicant-1',
      'experience-1',
      { title: 'Frontend Engineer' },
      {
        runTransaction: (operation) => operation(database),
        findRecord,
        updateRecord,
      },
    );

    expect(updateRecord).toHaveBeenCalledWith(
      'experience-1',
      'applicant-1',
      { title: 'Frontend Engineer' },
      database,
    );
    expect(result).toEqual(saved);
  });

  it('validates partial dates against stored experience', async () => {
    const updateRecord = vi.fn();

    await expect(
      updateExperience(
        'applicant-1',
        'experience-1',
        { endDate: new Date('2025-12-01') },
        {
          runTransaction: (operation) => operation({}),
          findRecord: vi.fn().mockResolvedValue({
            startDate: new Date('2026-01-01'),
            endDate: null,
          }),
          updateRecord,
        },
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 422 });

    expect(updateRecord).not.toHaveBeenCalled();
  });

  it('returns the same not-found response for missing or foreign experience', async () => {
    await expect(
      updateExperience('applicant-1', 'foreign-record', { title: 'Changed' }, {
        runTransaction: (operation) => operation({}),
        findRecord: vi.fn().mockResolvedValue(null),
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('deletes only an owned experience record', async () => {
    await expect(
      deleteExperience('applicant-1', 'experience-1', {
        deleteRecord: vi.fn().mockResolvedValue({ count: 1 }),
      }),
    ).resolves.toEqual({ deleted: true });
  });
});
