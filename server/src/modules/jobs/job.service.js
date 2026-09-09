import { listPublicJobs } from './job.repository.js';
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
