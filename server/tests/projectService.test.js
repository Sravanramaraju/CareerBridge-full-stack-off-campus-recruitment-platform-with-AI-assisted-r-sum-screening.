import { describe, expect, it, vi } from 'vitest';
import {
  createProject,
  deleteProject,
  updateProject,
} from '../src/modules/profiles/profile.service.js';

describe('applicant project service', () => {
  it('creates a project for the authenticated applicant', async () => {
    const record = { id: 'project-1', name: 'CareerBridge' };
    const createRecord = vi.fn().mockResolvedValue(record);

    await expect(
      createProject('applicant-1', { name: 'CareerBridge' }, { createRecord }),
    ).resolves.toEqual(record);
    expect(createRecord).toHaveBeenCalledWith('applicant-1', { name: 'CareerBridge' });
  });

  it('updates an owned project and returns its stored result', async () => {
    const database = { marker: 'transaction-client' };
    const current = {
      id: 'project-1',
      startedAt: new Date('2026-01-01'),
      completedAt: null,
    };
    const saved = { ...current, name: 'CareerBridge Platform' };
    const findRecord = vi.fn().mockResolvedValueOnce(current).mockResolvedValueOnce(saved);
    const updateRecord = vi.fn().mockResolvedValue({ count: 1 });

    const result = await updateProject(
      'applicant-1',
      'project-1',
      { name: 'CareerBridge Platform' },
      {
        runTransaction: (operation) => operation(database),
        findRecord,
        updateRecord,
      },
    );

    expect(updateRecord).toHaveBeenCalledWith(
      'project-1',
      'applicant-1',
      { name: 'CareerBridge Platform' },
      database,
    );
    expect(result).toEqual(saved);
  });

  it('validates partial dates against the stored project', async () => {
    const updateRecord = vi.fn();

    await expect(
      updateProject(
        'applicant-1',
        'project-1',
        { completedAt: new Date('2025-12-01') },
        {
          runTransaction: (operation) => operation({}),
          findRecord: vi.fn().mockResolvedValue({
            startedAt: new Date('2026-01-01'),
            completedAt: null,
          }),
          updateRecord,
        },
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 422 });

    expect(updateRecord).not.toHaveBeenCalled();
  });

  it('returns the same not-found response for missing or foreign projects', async () => {
    await expect(
      updateProject('applicant-1', 'foreign-project', { name: 'Changed' }, {
        runTransaction: (operation) => operation({}),
        findRecord: vi.fn().mockResolvedValue(null),
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('deletes only an owned project record', async () => {
    await expect(
      deleteProject('applicant-1', 'project-1', {
        deleteRecord: vi.fn().mockResolvedValue({ count: 1 }),
      }),
    ).resolves.toEqual({ deleted: true });
  });
});
