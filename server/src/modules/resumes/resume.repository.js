import { prisma } from '../../lib/database.js';

const resumeMetadataSelection = {
  id: true,
  originalFileName: true,
  mimeType: true,
  fileSize: true,
  isPrimary: true,
  parseStatus: true,
  parsedData: true,
  parseError: true,
  createdAt: true,
  updatedAt: true,
};

const ownedResumeWhere = (resumeId, userId) => ({
  id: resumeId,
  deletedAt: null,
  applicantProfile: { is: { userId } },
});

export function listApplicantResumes(userId, database = prisma) {
  return database.resume.findMany({
    where: { applicantProfile: { is: { userId } }, deletedAt: null },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    select: resumeMetadataSelection,
  });
}

export function createApplicantResume(userId, data, database = prisma) {
  return database.resume.create({
    data: { ...data, applicantProfile: { connect: { userId } } },
    select: resumeMetadataSelection,
  });
}

export function findOwnedResume(resumeId, userId, database = prisma) {
  return database.resume.findFirst({
    where: ownedResumeWhere(resumeId, userId),
  });
}

export function updateOwnedResume(resumeId, userId, data, database = prisma) {
  return database.resume.updateMany({
    where: ownedResumeWhere(resumeId, userId),
    data,
  });
}

export function findOwnedResumeMetadata(resumeId, userId, database = prisma) {
  return database.resume.findFirst({
    where: ownedResumeWhere(resumeId, userId),
    select: resumeMetadataSelection,
  });
}
