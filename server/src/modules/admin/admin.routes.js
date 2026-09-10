import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { getAdminDashboardHandler } from './admin.controller.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('ADMIN'));
adminRouter.get('/dashboard', getAdminDashboardHandler);
