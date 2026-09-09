import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { getApplicantProfileHandler } from './profile.controller.js';

export const applicantProfileRouter = Router();

applicantProfileRouter.use(requireAuth, requireRole('APPLICANT'));
applicantProfileRouter.get('/', getApplicantProfileHandler);
