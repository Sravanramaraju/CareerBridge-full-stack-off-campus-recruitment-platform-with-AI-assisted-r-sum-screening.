import { describe, expect, it, vi } from 'vitest';
import {
  createRecruiterApplicationNote,
  deleteAuthoredRecruiterNote,
  listRecruiterApplicationNotes,
} from '../src/modules/applications/recruiterNote.repository.js';

describe('recruiter note repository', () => {
  it('lists notes only through application company ownership', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await listRecruiterApplicationNotes('application-1', 'company-1', {
      recruiterNote: { findMany },
    });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        applicationId: 'application-1',
        application: { is: { job: { is: { companyId: 'company-1' } } } },
      },
    }));
  });

  it('records the authenticated recruiter as note author', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'note-1' });
    await createRecruiterApplicationNote(
      'application-1', 'recruiter-1', 'Strong portfolio.', { recruiterNote: { create } },
    );
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        applicationId: 'application-1',
        authorUserId: 'recruiter-1',
        body: 'Strong portfolio.',
      },
    }));
  });

  it('deletes notes only for their author inside the owning company', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    await deleteAuthoredRecruiterNote('note-1', 'company-1', 'recruiter-1', {
      recruiterNote: { deleteMany },
    });
    expect(deleteMany).toHaveBeenCalledWith({
      where: {
        id: 'note-1',
        authorUserId: 'recruiter-1',
        application: { is: { job: { is: { companyId: 'company-1' } } } },
      },
    });
  });
});
