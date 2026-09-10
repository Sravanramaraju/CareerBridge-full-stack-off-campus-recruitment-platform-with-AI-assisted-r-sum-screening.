import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  getApplicantApplicationHandler,
  listApplicantApplicationsHandler,
} from './application.controller.js';
import { applicationParamsSchema } from './application.schemas.js';

export const applicantApplicationRouter = Router();

applicantApplicationRouter.use(requireAuth, requireRole('APPLICANT'));
applicantApplicationRouter.get('/', listApplicantApplicationsHandler);
applicantApplicationRouter.get(
  '/:applicationId',
  validateRequest({ params: applicationParamsSchema }),
  getApplicantApplicationHandler,
);
