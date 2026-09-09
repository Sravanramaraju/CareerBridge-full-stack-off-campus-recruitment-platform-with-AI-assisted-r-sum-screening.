import { describe, expect, it, vi } from 'vitest';
import { createListCompaniesHandler } from '../src/modules/companies/company.controller.js';

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
});
