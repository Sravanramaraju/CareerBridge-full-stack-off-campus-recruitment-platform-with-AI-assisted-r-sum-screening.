import { AppError, notFoundError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import { findCompanyMembershipForUser } from '../companies/company.repository.js';
import { findRecruiterApplicationDetail } from './recruiterApplication.repository.js';
import {
  createRecruiterApplicationNote,
  deleteAuthoredRecruiterNote,
  listRecruiterApplicationNotes,
} from './recruiterNote.repository.js';

function membershipRequiredError() {
  return new AppError({
    code: 'COMPANY_MEMBERSHIP_REQUIRED',
    message: 'You do not have access to a recruiter company.',
    status: 403,
  });
}

function presentNote(note) {
  return {
    id: note.id,
    applicationId: note.applicationId,
    note: note.body,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    author: note.author,
  };
}

async function requireOwnedApplication(recruiterId, applicationId, database, dependencies) {
  const membership = await dependencies.findMembership(recruiterId, database);
  if (!membership) throw membershipRequiredError();
  const application = await dependencies.findApplication(
    applicationId,
    membership.company.id,
    database,
  );
  if (!application) throw notFoundError('The requested application was not found.');
  return membership;
}

export async function getRecruiterApplicationNotes(
  recruiterId,
  applicationId,
  {
    findMembership = findCompanyMembershipForUser,
    findApplication = findRecruiterApplicationDetail,
    listNotes = listRecruiterApplicationNotes,
  } = {},
) {
  const membership = await requireOwnedApplication(recruiterId, applicationId, undefined, {
    findMembership,
    findApplication,
  });
  const notes = await listNotes(applicationId, membership.company.id);
  return notes.map(presentNote);
}

export async function addRecruiterApplicationNote(
  recruiterId,
  applicationId,
  body,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findMembership = findCompanyMembershipForUser,
    findApplication = findRecruiterApplicationDetail,
    createNote = createRecruiterApplicationNote,
  } = {},
) {
  return runTransaction(async (database) => {
    await requireOwnedApplication(recruiterId, applicationId, database, {
      findMembership,
      findApplication,
    });
    return presentNote(await createNote(applicationId, recruiterId, body, database));
  });
}

export async function removeRecruiterNote(
  recruiterId,
  noteId,
  {
    findMembership = findCompanyMembershipForUser,
    deleteNote = deleteAuthoredRecruiterNote,
  } = {},
) {
  const membership = await findMembership(recruiterId);
  if (!membership) throw membershipRequiredError();
  const deleted = await deleteNote(noteId, membership.company.id, recruiterId);
  if (deleted.count !== 1) throw notFoundError('The requested note was not found.');
  return { noteId, deleted: true };
}
