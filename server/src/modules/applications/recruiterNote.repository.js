import { prisma } from '../../lib/database.js';

const noteSelection = {
  id: true,
  applicationId: true,
  body: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true } },
};

export function listRecruiterApplicationNotes(applicationId, companyId, database = prisma) {
  return database.recruiterNote.findMany({
    where: { applicationId, application: { is: { job: { is: { companyId } } } } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: noteSelection,
  });
}

export function createRecruiterApplicationNote(
  applicationId,
  authorUserId,
  body,
  database = prisma,
) {
  return database.recruiterNote.create({
    data: { applicationId, authorUserId, body },
    select: noteSelection,
  });
}

export function deleteAuthoredRecruiterNote(noteId, companyId, authorUserId, database = prisma) {
  return database.recruiterNote.deleteMany({
    where: {
      id: noteId,
      authorUserId,
      application: { is: { job: { is: { companyId } } } },
    },
  });
}
