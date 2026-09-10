import { describe, expect, it, vi } from 'vitest';
import {
  createGetAdminDashboardHandler,
  createListAdminCompaniesHandler,
  createModerateCompanyHandler,
} from '../src/modules/admin/admin.controller.js';

describe('admin dashboard controller', () => {
  it('returns the real dashboard service response', async () => {
    const data = { metrics: { totalUsers: 100 }, recentModeration: [] };
    const loadDashboard = vi.fn().mockResolvedValue(data);
    const response = { json: vi.fn((value) => value) };
    await createGetAdminDashboardHandler({ loadDashboard })({}, response, vi.fn());
    expect(loadDashboard).toHaveBeenCalledOnce();
    expect(response.json).toHaveBeenCalledWith({ data });
  });

  it('forwards dashboard failures to centralized error handling', async () => {
    const error = new Error('database unavailable');
    const next = vi.fn();
    await createGetAdminDashboardHandler({
      loadDashboard: vi.fn().mockRejectedValue(error),
    })({}, { json: vi.fn() }, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('lists companies using validated moderation filters', async () => {
    const query = { status: 'PENDING', page: 1, pageSize: 20 };
    const data = { items: [], pagination: { total: 0 } };
    const listCompanies = vi.fn().mockResolvedValue(data);
    const response = { json: vi.fn((value) => value) };
    await createListAdminCompaniesHandler({ listCompanies })(
      { validated: { query } }, response, vi.fn(),
    );
    expect(listCompanies).toHaveBeenCalledWith(query);
    expect(response.json).toHaveBeenCalledWith({ data });
  });

  it('passes admin identity and request context into company moderation', async () => {
    const company = { id: 'company-1', verificationStatus: 'VERIFIED' };
    const moderateCompany = vi.fn().mockResolvedValue(company);
    const response = { json: vi.fn((value) => value) };
    await createModerateCompanyHandler({ moderateCompany })(
      {
        id: 'request-1', ip: '127.0.0.1', auth: { user: { id: 'admin-1' } },
        validated: {
          params: { companyId: 'company-1' },
          body: { status: 'VERIFIED' },
        },
      },
      response,
      vi.fn(),
    );
    expect(moderateCompany).toHaveBeenCalledWith(
      'admin-1', 'company-1', { status: 'VERIFIED' },
      { requestId: 'request-1', ipAddress: '127.0.0.1' },
    );
    expect(response.json).toHaveBeenCalledWith({ data: company });
  });
});
