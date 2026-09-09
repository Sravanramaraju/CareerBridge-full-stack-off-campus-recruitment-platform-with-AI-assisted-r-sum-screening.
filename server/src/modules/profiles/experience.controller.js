import { createExperience, deleteExperience, updateExperience } from './profile.service.js';

export function createExperienceHandler({ createRecord = createExperience } = {}) {
  return async (request, response, next) => {
    try {
      const experience = await createRecord(request.auth.user.id, request.validated.body);
      return response.status(201).json({ data: experience });
    } catch (error) {
      return next(error);
    }
  };
}

export function createUpdateExperienceHandler({ updateRecord = updateExperience } = {}) {
  return async (request, response, next) => {
    try {
      const experience = await updateRecord(
        request.auth.user.id,
        request.validated.params.recordId,
        request.validated.body,
      );
      return response.json({ data: experience });
    } catch (error) {
      return next(error);
    }
  };
}

export function createDeleteExperienceHandler({ deleteRecord = deleteExperience } = {}) {
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

export const addExperienceHandler = createExperienceHandler();
export const updateExperienceHandler = createUpdateExperienceHandler();
export const deleteExperienceHandler = createDeleteExperienceHandler();
