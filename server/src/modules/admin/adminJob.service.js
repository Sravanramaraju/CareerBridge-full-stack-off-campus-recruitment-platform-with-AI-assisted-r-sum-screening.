import { toAdminJob } from './adminJob.presenter.js';
import { listAdminJobs } from './adminJob.repository.js';

export async function getAdminJobs(filters, { listJobs = listAdminJobs } = {}) {
  const { jobs, total } = await listJobs(filters);
  return {
    items: jobs.map(toAdminJob),
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  };
}
