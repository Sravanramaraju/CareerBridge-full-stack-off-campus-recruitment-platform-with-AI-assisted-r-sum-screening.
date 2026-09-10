import { prisma } from '../../lib/database.js';

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
