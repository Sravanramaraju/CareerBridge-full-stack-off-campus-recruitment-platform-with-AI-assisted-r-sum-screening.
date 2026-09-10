import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { getApplicantDashboardHandler } from './applicantDashboard.controller.js';

export const applicantDashboardRouter = Router();

applicantDashboardRouter.use(requireAuth, requireRole('APPLICANT'));
applicantDashboardRouter.get('/', getApplicantDashboardHandler);
