import { notFoundError } from '../../lib/appError.js';
import { findPublicJobByIdentifier } from '../jobs/job.repository.js';
import { toPublicJob } from '../jobs/job.presenter.js';
import {
  deleteApplicantSavedJob,
  listApplicantSavedJobs,
  upsertApplicantSavedJob,
} from './savedJob.repository.js';

const STATUS_LABELS = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
};

function presentSavedJob(entry) {
  return {
    ...toPublicJob(entry.job),
    status: STATUS_LABELS[entry.job.status] ?? entry.job.status,
    savedAt: entry.createdAt,
  };
}

export async function getApplicantSavedJobs(
  applicantId,
  { listSavedJobs = listApplicantSavedJobs } = {},
) {
  const entries = await listSavedJobs(applicantId);
  return entries.map(presentSavedJob);
}

export async function saveApplicantJob(
  applicantId,
  jobIdentifier,
  {
    findJob = findPublicJobByIdentifier,
    saveJob = upsertApplicantSavedJob,
    now = () => new Date(),
  } = {},
) {
  const job = await findJob(jobIdentifier, now());
  if (!job) throw notFoundError('The requested job is not available to save.');
  const saved = await saveJob(applicantId, job.id);
  return { jobId: saved.jobId, savedAt: saved.createdAt, saved: true };
}

export async function removeApplicantSavedJob(
  applicantId,
  jobId,
  { deleteSavedJob = deleteApplicantSavedJob } = {},
) {
  await deleteSavedJob(applicantId, jobId);
  return { jobId, saved: false };
}
