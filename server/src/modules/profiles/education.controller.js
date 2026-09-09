import { createEducation, deleteEducation, updateEducation } from './profile.service.js';

export function createEducationHandler({ createRecord = createEducation } = {}) {
  return async (request, response, next) => {
    try {
      const education = await createRecord(request.auth.user.id, request.validated.body);
      return response.status(201).json({ data: education });
    } catch (error) {
      return next(error);
    }
  };
}

export function createUpdateEducationHandler({ updateRecord = updateEducation } = {}) {
  return async (request, response, next) => {
    try {
      const education = await updateRecord(
        request.auth.user.id,
        request.validated.params.recordId,
        request.validated.body,
      );
      return response.json({ data: education });
    } catch (error) {
      return next(error);
    }
  };
}

export function createDeleteEducationHandler({ deleteRecord = deleteEducation } = {}) {
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

export const addEducationHandler = createEducationHandler();
export const updateEducationHandler = createUpdateEducationHandler();
export const deleteEducationHandler = createDeleteEducationHandler();
