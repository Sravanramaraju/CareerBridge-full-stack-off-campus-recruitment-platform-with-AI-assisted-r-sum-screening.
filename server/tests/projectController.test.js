import { describe, expect, it, vi } from 'vitest';
import {
  createDeleteProjectHandler,
  createProjectHandler,
  createUpdateProjectHandler,
} from '../src/modules/profiles/project.controller.js';

describe('applicant project controller', () => {
  it('creates a project for the authenticated applicant', async () => {
    const body = { name: 'CareerBridge', technologies: ['React', 'Node.js'] };
    const record = { id: 'project-1', ...body };
    const createRecord = vi.fn().mockResolvedValue(record);
    const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await createProjectHandler({ createRecord })(
      { auth: { user: { id: 'applicant-1' } }, validated: { body } },
      response,
      vi.fn(),
    );

    expect(createRecord).toHaveBeenCalledWith('applicant-1', body);
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ data: record });
  });

  it('updates an owned project with validated input', async () => {
    const updateRecord = vi.fn().mockResolvedValue({ id: 'project-1' });

    await createUpdateProjectHandler({ updateRecord })(
      {
        auth: { user: { id: 'applicant-1' } },
        validated: { params: { recordId: 'project-1' }, body: { name: 'New name' } },
      },
      { json: vi.fn() },
      vi.fn(),
    );

    expect(updateRecord).toHaveBeenCalledWith('applicant-1', 'project-1', {
      name: 'New name',
    });
  });

  it('deletes an owned project identifier', async () => {
    const deleteRecord = vi.fn().mockResolvedValue({ deleted: true });
    const response = { json: vi.fn() };

    await createDeleteProjectHandler({ deleteRecord })(
      {
        auth: { user: { id: 'applicant-1' } },
        validated: { params: { recordId: 'project-1' } },
      },
      response,
      vi.fn(),
    );

    expect(deleteRecord).toHaveBeenCalledWith('applicant-1', 'project-1');
    expect(response.json).toHaveBeenCalledWith({ data: { deleted: true } });
  });
});
