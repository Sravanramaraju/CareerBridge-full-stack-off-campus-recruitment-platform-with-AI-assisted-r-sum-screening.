const JOB_STATUS_LABELS = {
  DRAFT: 'Draft', PUBLISHED: 'Published', CLOSED: 'Closed', ARCHIVED: 'Archived',
};
const MODERATION_LABELS = {
  PENDING: 'Pending', CLEARED: 'Cleared', FLAGGED: 'Flagged', DEACTIVATED: 'Deactivated',
};

export function toAdminJob(job) {
  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    location: job.location,
    workMode: job.workMode,
    employmentType: job.employmentType,
    status: job.status,
    statusLabel: JOB_STATUS_LABELS[job.status],
    moderationStatus: job.moderationStatus,
    moderationLabel: MODERATION_LABELS[job.moderationStatus],
    deadline: job.deadline,
    publishedAt: job.publishedAt,
    company: job.company,
    applicationCount: job._count.applications,
    savedCount: job._count.savedBy,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}
