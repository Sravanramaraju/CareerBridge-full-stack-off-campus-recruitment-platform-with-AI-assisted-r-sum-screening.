import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { submitApplicationHandler } from '../applications/application.controller.js';
import { applicationCreateSchema } from '../applications/application.schemas.js';
import { getJobHandler, listJobsHandler } from './job.controller.js';
import { jobIdentifierParamsSchema, publicJobListQuerySchema } from './job.schemas.js';

export const jobRouter = Router();

jobRouter.get('/', validateRequest({ query: publicJobListQuerySchema }), listJobsHandler);
jobRouter.post(
  '/:jobId/applications',
  requireAuth,
  requireRole('APPLICANT'),
  validateRequest({ params: jobIdentifierParamsSchema, body: applicationCreateSchema }),
  submitApplicationHandler,
);
jobRouter.get(
  '/:jobId',
  validateRequest({ params: jobIdentifierParamsSchema }),
  getJobHandler,
);
