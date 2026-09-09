import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
import { getJobHandler, listJobsHandler } from './job.controller.js';
import { jobIdentifierParamsSchema, publicJobListQuerySchema } from './job.schemas.js';

export const jobRouter = Router();

jobRouter.get('/', validateRequest({ query: publicJobListQuerySchema }), listJobsHandler);
jobRouter.get(
  '/:jobId',
  validateRequest({ params: jobIdentifierParamsSchema }),
  getJobHandler,
);
