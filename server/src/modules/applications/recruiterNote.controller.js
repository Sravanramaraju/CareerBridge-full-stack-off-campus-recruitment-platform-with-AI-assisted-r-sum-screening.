import {
  addRecruiterApplicationNote,
  getRecruiterApplicationNotes,
  removeRecruiterNote,
} from './recruiterNote.service.js';

export function createListRecruiterNotesHandler({ listNotes = getRecruiterApplicationNotes } = {}) {
  return async (request, response, next) => {
    try {
      const notes = await listNotes(
        request.auth.user.id,
        request.validated.params.applicationId,
      );
      return response.json({ data: notes });
    } catch (error) {
      return next(error);
    }
  };
}

export function createAddRecruiterNoteHandler({ addNote = addRecruiterApplicationNote } = {}) {
  return async (request, response, next) => {
    try {
      const note = await addNote(
        request.auth.user.id,
        request.validated.params.applicationId,
        request.validated.body.body,
      );
      return response.status(201).json({ data: note });
    } catch (error) {
      return next(error);
    }
  };
}

export function createDeleteRecruiterNoteHandler({ deleteNote = removeRecruiterNote } = {}) {
  return async (request, response, next) => {
    try {
      const result = await deleteNote(request.auth.user.id, request.validated.params.noteId);
      return response.json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export const listRecruiterNotesHandler = createListRecruiterNotesHandler();
export const addRecruiterNoteHandler = createAddRecruiterNoteHandler();
export const deleteRecruiterNoteHandler = createDeleteRecruiterNoteHandler();
