import { createProject, deleteProject, updateProject } from './profile.service.js';

export function createProjectHandler({ createRecord = createProject } = {}) {
  return async (request, response, next) => {
    try {
      const project = await createRecord(request.auth.user.id, request.validated.body);
      return response.status(201).json({ data: project });
    } catch (error) {
      return next(error);
    }
  };
}

export function createUpdateProjectHandler({ updateRecord = updateProject } = {}) {
  return async (request, response, next) => {
    try {
      const project = await updateRecord(
        request.auth.user.id,
        request.validated.params.recordId,
        request.validated.body,
      );
      return response.json({ data: project });
    } catch (error) {
      return next(error);
    }
  };
}

export function createDeleteProjectHandler({ deleteRecord = deleteProject } = {}) {
  return async (request, response, next) => {
    try {
      const result = await deleteRecord(
        request.auth.user.id,
        request.validated.params.recordId,
      );
      return response.json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export const addProjectHandler = createProjectHandler();
export const updateProjectHandler = createUpdateProjectHandler();
export const deleteProjectHandler = createDeleteProjectHandler();
