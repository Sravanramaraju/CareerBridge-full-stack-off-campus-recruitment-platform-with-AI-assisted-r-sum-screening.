import { describe, expect, it, vi } from 'vitest';
import {
  createAddRecruiterNoteHandler,
  createDeleteRecruiterNoteHandler,
  createListRecruiterNotesHandler,
} from '../src/modules/applications/recruiterNote.controller.js';

const request = {
  auth: { user: { id: 'recruiter-1' } },
  validated: {
    params: { applicationId: 'application-1', noteId: 'note-1' },
    body: { body: 'Strong portfolio.' },
  },
};

describe('recruiter note controller', () => {
  it('lists notes for the validated application and recruiter identity', async () => {
    const listNotes = vi.fn().mockResolvedValue([{ id: 'note-1' }]);
    const response = { json: vi.fn((value) => value) };
    await createListRecruiterNotesHandler({ listNotes })(request, response, vi.fn());
    expect(listNotes).toHaveBeenCalledWith('recruiter-1', 'application-1');
    expect(response.json).toHaveBeenCalledWith({ data: [{ id: 'note-1' }] });
  });

  it('creates a validated note and returns created status', async () => {
    const addNote = vi.fn().mockResolvedValue({ id: 'note-1' });
    const response = { status: vi.fn(), json: vi.fn((value) => value) };
    response.status.mockReturnValue(response);
    await createAddRecruiterNoteHandler({ addNote })(request, response, vi.fn());
    expect(addNote).toHaveBeenCalledWith('recruiter-1', 'application-1', 'Strong portfolio.');
    expect(response.status).toHaveBeenCalledWith(201);
  });

  it('deletes a validated note using the recruiter identity', async () => {
    const deleteNote = vi.fn().mockResolvedValue({ noteId: 'note-1', deleted: true });
    await createDeleteRecruiterNoteHandler({ deleteNote })(
      request,
      { json: vi.fn() },
      vi.fn(),
    );
    expect(deleteNote).toHaveBeenCalledWith('recruiter-1', 'note-1');
  });

  it('forwards note failures to centralized error handling', async () => {
    const error = new Error('database unavailable');
    const next = vi.fn();
    await createListRecruiterNotesHandler({ listNotes: vi.fn().mockRejectedValue(error) })(
      request,
      { json: vi.fn() },
      next,
    );
    expect(next).toHaveBeenCalledWith(error);
  });
});
