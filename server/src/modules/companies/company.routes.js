import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
import { listCompaniesHandler } from './company.controller.js';
import { companyListQuerySchema } from './company.schemas.js';

export const companyRouter = Router();

companyRouter.get(
  '/',
  validateRequest({ query: companyListQuerySchema }),
  listCompaniesHandler,
);
