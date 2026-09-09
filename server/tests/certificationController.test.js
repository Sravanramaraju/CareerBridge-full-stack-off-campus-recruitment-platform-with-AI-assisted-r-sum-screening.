import { describe, expect, it, vi } from 'vitest';
import {
  createCertificationHandler,
  createDeleteCertificationHandler,
  createUpdateCertificationHandler,
} from '../src/modules/profiles/certification.controller.js';

describe('applicant certification controller', () => {
  it('creates a certification for the authenticated applicant', async () => {
    const body = { name: 'Cloud Practitioner', issuer: 'Amazon Web Services' };
    const record = { id: 'certification-1', ...body };
    const createRecord = vi.fn().mockResolvedValue(record);
    const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await createCertificationHandler({ createRecord })(
      { auth: { user: { id: 'applicant-1' } }, validated: { body } },
      response,
      vi.fn(),
    );

    expect(createRecord).toHaveBeenCalledWith('applicant-1', body);
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ data: record });
  });

  it('updates an owned certification with validated input', async () => {
    const updateRecord = vi.fn().mockResolvedValue({ id: 'certification-1' });

    await createUpdateCertificationHandler({ updateRecord })(
      {
        auth: { user: { id: 'applicant-1' } },
        validated: {
          params: { recordId: 'certification-1' },
          body: { credentialId: 'AWS-123' },
        },
      },
      { json: vi.fn() },
      vi.fn(),
    );

    expect(updateRecord).toHaveBeenCalledWith('applicant-1', 'certification-1', {
      credentialId: 'AWS-123',
    });
  });

  it('deletes an owned certification identifier', async () => {
    const deleteRecord = vi.fn().mockResolvedValue({ deleted: true });
    const response = { json: vi.fn() };

    await createDeleteCertificationHandler({ deleteRecord })(
      {
        auth: { user: { id: 'applicant-1' } },
        validated: { params: { recordId: 'certification-1' } },
      },
      response,
      vi.fn(),
    );

    expect(deleteRecord).toHaveBeenCalledWith('applicant-1', 'certification-1');
    expect(response.json).toHaveBeenCalledWith({ data: { deleted: true } });
  });
});
