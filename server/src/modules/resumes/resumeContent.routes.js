import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { getResumeContentHandler } from './resume.controller.js';
import { resumeParamsSchema } from './resume.schemas.js';

export const resumeContentRouter = Router();

resumeContentRouter.use(requireAuth, requireRole('APPLICANT', 'RECRUITER'));
resumeContentRouter.get(
  '/:resumeId/content',
  validateRequest({ params: resumeParamsSchema }),
  getResumeContentHandler,
);
