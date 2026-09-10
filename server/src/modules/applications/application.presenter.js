import { toPublicJob } from '../jobs/job.presenter.js';

const APPLICATION_STATUS_LABELS = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Screening',
  SHORTLISTED: 'Assessment',
  INTERVIEW: 'Interview',
  OFFERED: 'Offer',
  REJECTED: 'Not selected',
  WITHDRAWN: 'Withdrawn',
};

const JOB_STATUS_LABELS = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
};

function statusLabel(status) {
  return APPLICATION_STATUS_LABELS[status] ?? status;
}

function presentJob(job) {
  return {
    ...toPublicJob(job),
    status: JOB_STATUS_LABELS[job.status] ?? job.status,
    statusCode: job.status,
  };
}

export function toApplicantApplication(application) {
  const history = application.statusHistory.map((event) => ({
    id: event.id,
    previousStatus: event.previousStatus,
    previousStatusLabel: event.previousStatus ? statusLabel(event.previousStatus) : null,
    newStatus: event.newStatus,
    status: statusLabel(event.newStatus),
    reason: event.reason,
    note: event.reason || `Application moved to ${statusLabel(event.newStatus)}.`,
    createdAt: event.createdAt,
    date: event.createdAt,
  }));

  return {
    id: application.id,
    jobId: application.jobId,
    resumeId: application.resumeId,
    coverNote: application.coverNote,
    statusCode: application.status,
    status: statusLabel(application.status),
    appliedAt: application.appliedAt,
    updatedAt: application.updatedAt,
    job: presentJob(application.job),
    resume: {
      id: application.resume.id,
      name: application.resume.originalFileName,
      mimeType: application.resume.mimeType,
      fileSize: application.resume.fileSize,
      parseStatus: application.resume.parseStatus,
      createdAt: application.resume.createdAt,
    },
    screeningAnswers: application.screeningAnswers,
    history,
    timeline: history,
  };
}
