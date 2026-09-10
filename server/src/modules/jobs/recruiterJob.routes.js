import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  archiveRecruiterJobHandler,
  closeRecruiterJobHandler,
  createRecruiterJobHandler,
  getRecruiterJobHandler,
  listRecruiterJobsHandler,
  publishRecruiterJobHandler,
  reopenRecruiterJobHandler,
  updateRecruiterJobHandler,
} from './recruiterJob.controller.js';
import {
  jobIdentifierParamsSchema,
  recruiterJobCreateSchema,
  recruiterJobUpdateSchema,
} from './job.schemas.js';

export const recruiterJobRouter = Router();
const validateJobId = validateRequest({ params: jobIdentifierParamsSchema });

recruiterJobRouter.use(requireAuth, requireRole('RECRUITER'));
recruiterJobRouter.get('/', listRecruiterJobsHandler);
recruiterJobRouter.post(
  '/',
  validateRequest({ body: recruiterJobCreateSchema }),
  createRecruiterJobHandler,
);
recruiterJobRouter.get('/:jobId', validateJobId, getRecruiterJobHandler);
recruiterJobRouter.patch(
  '/:jobId',
  validateRequest({ params: jobIdentifierParamsSchema, body: recruiterJobUpdateSchema }),
  updateRecruiterJobHandler,
);
recruiterJobRouter.post('/:jobId/publish', validateJobId, publishRecruiterJobHandler);
recruiterJobRouter.post('/:jobId/close', validateJobId, closeRecruiterJobHandler);
recruiterJobRouter.post('/:jobId/reopen', validateJobId, reopenRecruiterJobHandler);
recruiterJobRouter.delete('/:jobId', validateJobId, archiveRecruiterJobHandler);
