import { prisma } from '../../lib/database.js';
import { jobRecordSelection } from '../jobs/job.repository.js';

const applicationSummarySelection = {
  id: true,
  applicantId: true,
  jobId: true,
  resumeId: true,
  coverNote: true,
  status: true,
  appliedAt: true,
  updatedAt: true,
};

const applicantApplicationSelection = {
  ...applicationSummarySelection,
  job: { select: jobRecordSelection },
  resume: {
    select: {
      id: true,
      originalFileName: true,
      mimeType: true,
      fileSize: true,
      isPrimary: true,
      parseStatus: true,
      createdAt: true,
    },
  },
  screeningAnswers: {
    select: {
      id: true,
      questionId: true,
      questionSnapshot: true,
      answer: true,
    },
    orderBy: { createdAt: 'asc' },
  },
  statusHistory: {
    select: {
      id: true,
      previousStatus: true,
      newStatus: true,
      reason: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  },
};

export function findApplicantApplicationByJob(applicantId, jobId, database = prisma) {
  return database.application.findUnique({
    where: { applicantId_jobId: { applicantId, jobId } },
    select: applicationSummarySelection,
  });
}

export function createApplicantApplication(
  applicantId,
  jobId,
  { resumeId, coverNote, screeningAnswers },
  database = prisma,
) {
  return database.application.create({
    data: {
      applicantId,
      jobId,
      resumeId,
      coverNote: coverNote || null,
      status: 'APPLIED',
      screeningAnswers: {
        create: screeningAnswers.map(({ questionId, questionSnapshot, answer }) => ({
          questionId,
          questionSnapshot,
          answer,
        })),
      },
      statusHistory: {
        create: {
          previousStatus: null,
          newStatus: 'APPLIED',
          changedByUserId: applicantId,
          reason: 'Application submitted.',
        },
      },
    },
    select: applicationSummarySelection,
  });
}

export function listOwnedApplicantApplications(applicantId, database = prisma) {
  return database.application.findMany({
    where: { applicantId },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    select: applicantApplicationSelection,
  });
}

export function findOwnedApplicantApplication(applicationId, applicantId, database = prisma) {
  return database.application.findFirst({
    where: { id: applicationId, applicantId },
    select: applicantApplicationSelection,
  });
}
