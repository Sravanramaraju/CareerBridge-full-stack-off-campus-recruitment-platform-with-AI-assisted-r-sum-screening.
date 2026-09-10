import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { jobIdentifierParamsSchema } from '../jobs/job.schemas.js';
import {
  listSavedJobsHandler,
  removeSavedJobHandler,
  saveJobHandler,
} from './savedJob.controller.js';

export const applicantSavedJobRouter = Router();
const validateJobId = validateRequest({ params: jobIdentifierParamsSchema });

applicantSavedJobRouter.use(requireAuth, requireRole('APPLICANT'));
applicantSavedJobRouter.get('/', listSavedJobsHandler);
applicantSavedJobRouter.put('/:jobId', validateJobId, saveJobHandler);
applicantSavedJobRouter.delete('/:jobId', validateJobId, removeSavedJobHandler);
