import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
import { listCompanyJobsHandler } from '../jobs/job.controller.js';
import { publicJobListQuerySchema } from '../jobs/job.schemas.js';
import { getCompanyHandler, listCompaniesHandler } from './company.controller.js';
import {
  companyIdentifierParamsSchema,
  companyListQuerySchema,
} from './company.schemas.js';

export const companyRouter = Router();

companyRouter.get(
  '/',
  validateRequest({ query: companyListQuerySchema }),
  listCompaniesHandler,
);
companyRouter.get(
  '/:companyId/jobs',
  validateRequest({
    params: companyIdentifierParamsSchema,
    query: publicJobListQuerySchema,
  }),
  listCompanyJobsHandler,
);
companyRouter.get(
  '/:companyId',
  validateRequest({ params: companyIdentifierParamsSchema }),
  getCompanyHandler,
);
