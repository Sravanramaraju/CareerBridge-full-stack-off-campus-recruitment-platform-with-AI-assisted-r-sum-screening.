import { describe, expect, it, vi } from 'vitest';
import {
  createGetRecruiterCompanyHandler,
  createUpdateRecruiterCompanyHandler,
} from '../src/modules/companies/recruiterCompany.controller.js';

describe('recruiter company controller', () => {
  it('loads company ownership from the authenticated user', async () => {
    const company = { id: 'company-1', name: 'Northstar Labs' };
    const getCompany = vi.fn().mockResolvedValue(company);
    const response = { json: vi.fn((body) => body) };

    await createGetRecruiterCompanyHandler({ getCompany })(
      { auth: { user: { id: 'recruiter-1' } } },
      response,
      vi.fn(),
    );

    expect(getCompany).toHaveBeenCalledWith('recruiter-1');
    expect(response.json).toHaveBeenCalledWith({ data: company });
  });

  it('passes only validated updates with the authenticated user id', async () => {
    const body = { about: 'Updated company profile.' };
    const company = { id: 'company-1', about: body.about };
    const updateCompany = vi.fn().mockResolvedValue(company);
    const response = { json: vi.fn((value) => value) };

    await createUpdateRecruiterCompanyHandler({ updateCompany })(
      {
        auth: { user: { id: 'recruiter-1' } },
        validated: { body },
      },
      response,
      vi.fn(),
    );

    expect(updateCompany).toHaveBeenCalledWith('recruiter-1', body);
    expect(response.json).toHaveBeenCalledWith({ data: company });
  });
});
