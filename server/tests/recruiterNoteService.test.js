import { describe, expect, it, vi } from 'vitest';
import {
  addRecruiterApplicationNote,
  getRecruiterApplicationNotes,
  removeRecruiterNote,
} from '../src/modules/applications/recruiterNote.service.js';

const membership = { company: { id: 'company-1' } };

describe('recruiter note service', () => {
  it('verifies application ownership before listing private notes', async () => {
    const listNotes = vi.fn().mockResolvedValue([{
      id: 'note-1', applicationId: 'application-1', body: 'Strong evidence.',
      createdAt: new Date(), updatedAt: new Date(), author: { id: 'recruiter-1' },
    }]);
    await expect(getRecruiterApplicationNotes('recruiter-1', 'application-1', {
      findMembership: vi.fn().mockResolvedValue(membership),
      findApplication: vi.fn().mockResolvedValue({ id: 'application-1' }),
      listNotes,
    })).resolves.toEqual([expect.objectContaining({ note: 'Strong evidence.' })]);
    expect(listNotes).toHaveBeenCalledWith('application-1', 'company-1');
  });

  it('creates authored notes only after transactional ownership verification', async () => {
    const database = { marker: 'transaction-client' };
    const createNote = vi.fn().mockResolvedValue({
      id: 'note-1', applicationId: 'application-1', body: 'Strong evidence.',
      createdAt: new Date(), updatedAt: new Date(), author: { id: 'recruiter-1' },
    });
    await addRecruiterApplicationNote('recruiter-1', 'application-1', 'Strong evidence.', {
      runTransaction: (operation) => operation(database),
      findMembership: vi.fn().mockResolvedValue(membership),
      findApplication: vi.fn().mockResolvedValue({ id: 'application-1' }),
      createNote,
    });
    expect(createNote).toHaveBeenCalledWith(
      'application-1', 'recruiter-1', 'Strong evidence.', database,
    );
  });

  it('uses generic not-found behavior for foreign applications', async () => {
    await expect(addRecruiterApplicationNote('recruiter-1', 'foreign', 'Note', {
      runTransaction: (operation) => operation({}),
      findMembership: vi.fn().mockResolvedValue(membership),
      findApplication: vi.fn().mockResolvedValue(null),
    })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('allows only the note author in the owning company to delete', async () => {
    const deleteNote = vi.fn().mockResolvedValue({ count: 1 });
    await expect(removeRecruiterNote('recruiter-1', 'note-1', {
      findMembership: vi.fn().mockResolvedValue(membership),
      deleteNote,
    })).resolves.toEqual({ noteId: 'note-1', deleted: true });
    expect(deleteNote).toHaveBeenCalledWith('note-1', 'company-1', 'recruiter-1');
  });

  it('does not reveal whether a foreign or non-authored note exists', async () => {
    await expect(removeRecruiterNote('recruiter-1', 'note-foreign', {
      findMembership: vi.fn().mockResolvedValue(membership),
      deleteNote: vi.fn().mockResolvedValue({ count: 0 }),
    })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});
