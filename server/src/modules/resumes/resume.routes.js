import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  deleteResumeHandler,
  listResumesHandler,
  setPrimaryResumeHandler,
  uploadResumeHandler,
} from './resume.controller.js';
import { resumeParamsSchema } from './resume.schemas.js';
import { resumeUploadMiddleware } from './resumeUpload.middleware.js';

export const applicantResumeRouter = Router();

applicantResumeRouter.use(requireAuth, requireRole('APPLICANT'));
applicantResumeRouter.get('/', listResumesHandler);
applicantResumeRouter.post('/', resumeUploadMiddleware, uploadResumeHandler);
applicantResumeRouter.patch(
  '/:resumeId/primary',
  validateRequest({ params: resumeParamsSchema }),
  setPrimaryResumeHandler,
);
applicantResumeRouter.delete(
  '/:resumeId',
  validateRequest({ params: resumeParamsSchema }),
  deleteResumeHandler,
);
