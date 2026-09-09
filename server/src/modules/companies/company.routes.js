import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
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
  '/:companyId',
  validateRequest({ params: companyIdentifierParamsSchema }),
  getCompanyHandler,
);
