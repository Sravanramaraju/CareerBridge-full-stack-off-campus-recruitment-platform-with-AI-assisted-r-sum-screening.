import { getAdminDashboardMetrics } from './adminDashboard.repository.js';

export async function getAdminDashboard(
  { loadMetrics = getAdminDashboardMetrics, now = () => new Date() } = {},
) {
  const metrics = await loadMetrics();
  return {
    metrics: {
      totalUsers: metrics.totalUsers,
      activeApplicants: metrics.activeApplicants,
      recruiters: metrics.recruiters,
      pendingCompanies: metrics.pendingCompanies,
      publishedJobs: metrics.publishedJobs,
      flaggedJobs: metrics.flaggedJobs,
      applications: metrics.applications,
    },
    recentModeration: metrics.recentModeration,
    generatedAt: now(),
  };
}
