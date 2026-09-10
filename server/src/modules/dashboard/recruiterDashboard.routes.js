import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { getRecruiterDashboardHandler } from './recruiterDashboard.controller.js';

export const recruiterDashboardRouter = Router();

recruiterDashboardRouter.use(requireAuth, requireRole('RECRUITER'));
recruiterDashboardRouter.get('/', getRecruiterDashboardHandler);
