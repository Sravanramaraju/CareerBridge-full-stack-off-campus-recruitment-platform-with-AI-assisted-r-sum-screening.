import { describe, expect, it, vi } from 'vitest';
import {
  createGetCompanyHandler,
  createListCompaniesHandler,
} from '../src/modules/companies/company.controller.js';

describe('company controller', () => {
  it('returns the public company collection in the API data envelope', async () => {
    const query = { page: 1, pageSize: 12 };
    const result = {
      items: [{ id: 'company-1', name: 'Northstar Labs' }],
      pagination: { page: 1, pageSize: 12, total: 1, totalPages: 1 },
    };
    const getCompanies = vi.fn().mockResolvedValue(result);
    const response = { json: vi.fn((body) => body) };
    const next = vi.fn();

    await createListCompaniesHandler({ getCompanies })(
      { validated: { query } },
      response,
      next,
    );

    expect(getCompanies).toHaveBeenCalledWith(query);
    expect(response.json).toHaveBeenCalledWith({ data: result });
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards service failures to the central error handler', async () => {
    const error = new Error('database unavailable');
    const next = vi.fn();

    await createListCompaniesHandler({ getCompanies: vi.fn().mockRejectedValue(error) })(
      { validated: { query: {} } },
      { json: vi.fn() },
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });

  it('returns a company detail resolved from validated parameters', async () => {
    const company = { id: 'company-1', name: 'Northstar Labs' };
    const getCompany = vi.fn().mockResolvedValue(company);
    const response = { json: vi.fn((body) => body) };

    await createGetCompanyHandler({ getCompany })(
      { validated: { params: { companyId: 'northstar-labs' } } },
      response,
      vi.fn(),
    );

    expect(getCompany).toHaveBeenCalledWith('northstar-labs');
    expect(response.json).toHaveBeenCalledWith({ data: company });
  });
});
