import { toRecruiterCandidate } from './recruiterApplication.presenter.js';

const STATUS_LABELS = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  OFFERED: 'Offered',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

function statusLabel(status) {
  return status ? STATUS_LABELS[status] ?? status : null;
}

export function toRecruiterApplicationDetail(application, now = new Date()) {
  const candidate = toRecruiterCandidate(application, now);
  const profile = application.applicant.applicantProfile;
  return {
    ...candidate,
    coverNote: application.coverNote,
    summary: profile?.summary || 'No professional summary provided.',
    education: profile?.applicantEducations ?? [],
    experienceRecords: profile?.experiences ?? [],
    projects: profile?.projects ?? [],
    certifications: profile?.certifications ?? [],
    preferences: {
      locations: profile?.preferredLocations ?? [],
      jobTypes: profile?.preferredJobTypes ?? [],
      workModes: profile?.preferredWorkModes ?? [],
    },
    resume: {
      id: application.resume.id,
      name: application.resume.originalFileName,
      mimeType: application.resume.mimeType,
      fileSize: application.resume.fileSize,
      parseStatus: application.resume.parseStatus,
      createdAt: application.resume.createdAt,
      contentUrl: `/api/v1/resumes/${application.resume.id}/content`,
    },
    screeningAnswers: application.screeningAnswers,
    history: application.statusHistory.map((event) => ({
      id: event.id,
      previousStatusCode: event.previousStatus,
      previousStatus: statusLabel(event.previousStatus),
      statusCode: event.newStatus,
      status: statusLabel(event.newStatus),
      reason: event.reason,
      changedAt: event.createdAt,
      changedBy: event.changedBy,
    })),
    notes: application.recruiterNotes.map((note) => ({
      id: note.id,
      note: note.body,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      author: note.author,
    })),
    job: application.job,
    requiredCoverage: application.match ? `${application.match.requiredSkillScore}%` : 'Unavailable',
    preferredCoverage: application.match ? `${application.match.preferredSkillScore}%` : 'Unavailable',
    missing: application.match?.requiredSkillsMissing ?? [],
  };
}
