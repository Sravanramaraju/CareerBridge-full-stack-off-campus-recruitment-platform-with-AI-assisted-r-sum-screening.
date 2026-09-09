import { notFoundError } from '../../lib/appError.js';
import { findPublicJobByIdentifier, listPublicJobs } from './job.repository.js';
import { toPublicJob } from './job.presenter.js';

export async function getPublicJobs(
  filters,
  {
    companyIdentifier,
    listJobs = listPublicJobs,
    now = () => new Date(),
  } = {},
) {
  const { jobs, total } = await listJobs(filters, now(), undefined, companyIdentifier);

  return {
    items: jobs.map(toPublicJob),
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  };
}

export async function getPublicJob(
  identifier,
  { findJob = findPublicJobByIdentifier, now = () => new Date() } = {},
) {
  const job = await findJob(identifier, now());
  if (!job) throw notFoundError('The requested job is not available.');
  return toPublicJob(job);
}
