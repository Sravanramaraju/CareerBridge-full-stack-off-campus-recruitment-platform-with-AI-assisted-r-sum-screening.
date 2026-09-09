import { describe, expect, it, vi } from 'vitest';
import {
  createDeleteEducationHandler,
  createEducationHandler,
  createUpdateEducationHandler,
} from '../src/modules/profiles/education.controller.js';

describe('applicant education controller', () => {
  it('creates education for the authenticated applicant', async () => {
    const body = { institution: 'University', qualification: 'B.E.' };
    const record = { id: 'education-1', ...body };
    const createRecord = vi.fn().mockResolvedValue(record);
    const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await createEducationHandler({ createRecord })(
      { auth: { user: { id: 'applicant-1' } }, validated: { body } },
      response,
      vi.fn(),
    );

    expect(createRecord).toHaveBeenCalledWith('applicant-1', body);
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ data: record });
  });

  it('updates an owned education identifier with validated input', async () => {
    const updateRecord = vi.fn().mockResolvedValue({ id: 'education-1', grade: 'A' });

    await createUpdateEducationHandler({ updateRecord })(
      {
        auth: { user: { id: 'applicant-1' } },
        validated: { params: { recordId: 'education-1' }, body: { grade: 'A' } },
      },
      { json: vi.fn() },
      vi.fn(),
    );

    expect(updateRecord).toHaveBeenCalledWith('applicant-1', 'education-1', { grade: 'A' });
  });

  it('deletes an owned education identifier', async () => {
    const deleteRecord = vi.fn().mockResolvedValue({ deleted: true });
    const response = { json: vi.fn() };

    await createDeleteEducationHandler({ deleteRecord })(
      {
        auth: { user: { id: 'applicant-1' } },
        validated: { params: { recordId: 'education-1' } },
      },
      response,
      vi.fn(),
    );

    expect(deleteRecord).toHaveBeenCalledWith('applicant-1', 'education-1');
    expect(response.json).toHaveBeenCalledWith({ data: { deleted: true } });
  });
});
