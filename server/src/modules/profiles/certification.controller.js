import {
  createCertification,
  deleteCertification,
  updateCertification,
} from './profile.service.js';

export function createCertificationHandler({ createRecord = createCertification } = {}) {
  return async (request, response, next) => {
    try {
      const certification = await createRecord(request.auth.user.id, request.validated.body);
      return response.status(201).json({ data: certification });
    } catch (error) {
      return next(error);
    }
  };
}

export function createUpdateCertificationHandler({ updateRecord = updateCertification } = {}) {
  return async (request, response, next) => {
    try {
      const certification = await updateRecord(
        request.auth.user.id,
        request.validated.params.recordId,
        request.validated.body,
      );
      return response.json({ data: certification });
    } catch (error) {
      return next(error);
    }
  };
}

export function createDeleteCertificationHandler({ deleteRecord = deleteCertification } = {}) {
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

export const addCertificationHandler = createCertificationHandler();
export const updateCertificationHandler = createUpdateCertificationHandler();
export const deleteCertificationHandler = createDeleteCertificationHandler();
