import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { recruiterCompanyUpdateSchema } from './company.schemas.js';
import {
  getRecruiterCompanyHandler,
  updateRecruiterCompanyHandler,
} from './recruiterCompany.controller.js';

export const recruiterCompanyRouter = Router();

recruiterCompanyRouter.use(requireAuth, requireRole('RECRUITER'));
recruiterCompanyRouter.get('/', getRecruiterCompanyHandler);
recruiterCompanyRouter.patch(
  '/',
  validateRequest({ body: recruiterCompanyUpdateSchema }),
  updateRecruiterCompanyHandler,
);
