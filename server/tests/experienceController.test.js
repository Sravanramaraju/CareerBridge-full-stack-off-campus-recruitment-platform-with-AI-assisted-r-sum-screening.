import { describe, expect, it, vi } from 'vitest';
import {
  createDeleteExperienceHandler,
  createExperienceHandler,
  createUpdateExperienceHandler,
} from '../src/modules/profiles/experience.controller.js';

describe('applicant experience controller', () => {
  it('creates experience for the authenticated applicant', async () => {
    const body = { title: 'Frontend Intern', organization: 'Northstar Labs' };
    const record = { id: 'experience-1', ...body };
    const createRecord = vi.fn().mockResolvedValue(record);
    const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await createExperienceHandler({ createRecord })(
      { auth: { user: { id: 'applicant-1' } }, validated: { body } },
      response,
      vi.fn(),
    );

    expect(createRecord).toHaveBeenCalledWith('applicant-1', body);
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ data: record });
  });

  it('updates an owned experience with validated input', async () => {
    const updateRecord = vi.fn().mockResolvedValue({ id: 'experience-1' });

    await createUpdateExperienceHandler({ updateRecord })(
      {
        auth: { user: { id: 'applicant-1' } },
        validated: { params: { recordId: 'experience-1' }, body: { title: 'Engineer' } },
      },
      { json: vi.fn() },
      vi.fn(),
    );

    expect(updateRecord).toHaveBeenCalledWith('applicant-1', 'experience-1', {
      title: 'Engineer',
    });
  });

  it('deletes an owned experience identifier', async () => {
    const deleteRecord = vi.fn().mockResolvedValue({ deleted: true });
    const response = { json: vi.fn() };

    await createDeleteExperienceHandler({ deleteRecord })(
      {
        auth: { user: { id: 'applicant-1' } },
        validated: { params: { recordId: 'experience-1' } },
      },
      response,
      vi.fn(),
    );

    expect(deleteRecord).toHaveBeenCalledWith('applicant-1', 'experience-1');
    expect(response.json).toHaveBeenCalledWith({ data: { deleted: true } });
  });
});
