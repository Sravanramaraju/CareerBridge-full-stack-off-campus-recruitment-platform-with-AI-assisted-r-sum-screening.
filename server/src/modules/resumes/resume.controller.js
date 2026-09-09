import {
  deleteApplicantResume,
  getApplicantResumes,
  setPrimaryResume,
  uploadApplicantResume,
} from './resume.service.js';

export function createListResumesHandler({ listResumes = getApplicantResumes } = {}) {
  return async (request, response, next) => {
    try {
      return response.json({ data: await listResumes(request.auth.user.id) });
    } catch (error) {
      return next(error);
    }
  };
}

export function createUploadResumeHandler({ uploadResume = uploadApplicantResume } = {}) {
  return async (request, response, next) => {
    try {
      const resume = await uploadResume(request.auth.user.id, request.file);
      return response.status(201).json({ data: resume });
    } catch (error) {
      return next(error);
    }
  };
}

export function createSetPrimaryResumeHandler({ setPrimary = setPrimaryResume } = {}) {
  return async (request, response, next) => {
    try {
      const resume = await setPrimary(request.auth.user.id, request.validated.params.resumeId);
      return response.json({ data: resume });
    } catch (error) {
      return next(error);
    }
  };
}

export function createDeleteResumeHandler({ deleteResume = deleteApplicantResume } = {}) {
  return async (request, response, next) => {
    try {
      const result = await deleteResume(request.auth.user.id, request.validated.params.resumeId);
      return response.json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export const listResumesHandler = createListResumesHandler();
export const uploadResumeHandler = createUploadResumeHandler();
export const setPrimaryResumeHandler = createSetPrimaryResumeHandler();
export const deleteResumeHandler = createDeleteResumeHandler();
