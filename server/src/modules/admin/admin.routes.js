import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  getAdminDashboardHandler,
  listAdminCompaniesHandler,
  listAdminJobsHandler,
  listAdminUsersHandler,
  moderateCompanyHandler,
  moderateJobHandler,
  moderateUserHandler,
} from './admin.controller.js';
import {
  adminCompanyListQuerySchema,
  adminCompanyParamsSchema,
  adminJobListQuerySchema,
  adminJobParamsSchema,
  adminUserListQuerySchema,
  adminUserParamsSchema,
  companyVerificationSchema,
  jobModerationSchema,
  userStatusSchema,
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
adminRouter.get(
  '/users',
  validateRequest({ query: adminUserListQuerySchema }),
  listAdminUsersHandler,
);
adminRouter.patch(
  '/users/:userId/status',
  validateRequest({ params: adminUserParamsSchema, body: userStatusSchema }),
  moderateUserHandler,
);
