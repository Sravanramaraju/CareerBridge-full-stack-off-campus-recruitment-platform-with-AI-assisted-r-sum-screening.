import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  getAdminDashboardHandler,
  listAdminCompaniesHandler,
  listAdminJobsHandler,
  moderateCompanyHandler,
  moderateJobHandler,
} from './admin.controller.js';
import {
  adminCompanyListQuerySchema,
  adminCompanyParamsSchema,
  adminJobListQuerySchema,
  adminJobParamsSchema,
  companyVerificationSchema,
  jobModerationSchema,
} from './admin.schemas.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('ADMIN'));
adminRouter.get('/dashboard', getAdminDashboardHandler);
adminRouter.get(
  '/companies',
  validateRequest({ query: adminCompanyListQuerySchema }),
  listAdminCompaniesHandler,
);
adminRouter.patch(
  '/companies/:companyId/verification',
  validateRequest({ params: adminCompanyParamsSchema, body: companyVerificationSchema }),
  moderateCompanyHandler,
);
adminRouter.get(
  '/jobs',
  validateRequest({ query: adminJobListQuerySchema }),
  listAdminJobsHandler,
);
adminRouter.patch(
  '/jobs/:jobId/moderation',
  validateRequest({ params: adminJobParamsSchema, body: jobModerationSchema }),
  moderateJobHandler,
);
