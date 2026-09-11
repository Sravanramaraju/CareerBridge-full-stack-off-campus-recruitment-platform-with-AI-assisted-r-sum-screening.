import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiClient = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/src/services/apiClient', () => ({ apiClient }));

import { companiesService } from '@/src/services/companiesService';
import { jobsService } from '@/src/services/jobsService';

describe('API catalog services', () => {
  beforeEach(() => vi.clearAllMocks());

  it('serializes job search filters using the backend contract', async () => {
    apiClient.get.mockResolvedValue({ items: [], pagination: { total: 0 } });
    await jobsService.getJobs({
      keyword: 'React engineer', modes: ['Remote', 'Hybrid'], page: 2, pageSize: 6,
    });
    expect(apiClient.get).toHaveBeenCalledWith(
      '/jobs?q=React+engineer&modes=Remote&modes=Hybrid&page=2&pageSize=6',
      undefined,
    );
  });

  it('encodes job and company identifiers in detail URLs', async () => {
    apiClient.get.mockResolvedValue({});
    await jobsService.getJobById('role/front end');
    await jobsService.getCompanyJobs('company/northstar', { pageSize: 20 });
    await companiesService.getCompanyById('company/northstar');
    expect(apiClient.get).toHaveBeenNthCalledWith(1, '/jobs/role%2Ffront%20end', undefined);
    expect(apiClient.get).toHaveBeenNthCalledWith(
      2, '/companies/company%2Fnorthstar/jobs?pageSize=20', undefined,
    );
    expect(apiClient.get).toHaveBeenNthCalledWith(
      3, '/companies/company%2Fnorthstar', undefined,
    );
  });

  it('queries server-side company filters and applicant job matches', async () => {
    apiClient.get.mockResolvedValue({});
    await companiesService.getCompanies({ q: 'Northstar', location: 'Bengaluru' });
    await jobsService.getJobMatch('job-1');
    expect(apiClient.get).toHaveBeenNthCalledWith(
      1, '/companies?q=Northstar&location=Bengaluru', undefined,
    );
    expect(apiClient.get).toHaveBeenNthCalledWith(2, '/jobs/job-1/match', undefined);
  });
});
