import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { getRecruiterApplicationHandler } from './recruiterApplication.controller.js';
import { applicationParamsSchema } from './application.schemas.js';

export const recruiterApplicationRouter = Router();

recruiterApplicationRouter.use(requireAuth, requireRole('RECRUITER'));
recruiterApplicationRouter.get(
  '/:applicationId',
  validateRequest({ params: applicationParamsSchema }),
  getRecruiterApplicationHandler,
);
