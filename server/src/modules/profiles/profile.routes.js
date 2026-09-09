import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  getApplicantProfileHandler,
  updateApplicantProfileHandler,
} from './profile.controller.js';
import { applicantProfileUpdateSchema } from './profile.schemas.js';

export const applicantProfileRouter = Router();

applicantProfileRouter.use(requireAuth, requireRole('APPLICANT'));
applicantProfileRouter.get('/', getApplicantProfileHandler);
applicantProfileRouter.patch(
  '/',
  validateRequest({ body: applicantProfileUpdateSchema }),
  updateApplicantProfileHandler,
);
