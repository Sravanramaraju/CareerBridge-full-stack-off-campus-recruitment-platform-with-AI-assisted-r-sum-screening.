import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  addEducationHandler,
  deleteEducationHandler,
  updateEducationHandler,
} from './education.controller.js';
import {
  applicantEducationCreateSchema,
  applicantEducationUpdateSchema,
  profileRecordParamsSchema,
} from './profile.schemas.js';

export const applicantEducationRouter = Router();

applicantEducationRouter.use(requireAuth, requireRole('APPLICANT'));
applicantEducationRouter.post(
  '/',
  validateRequest({ body: applicantEducationCreateSchema }),
  addEducationHandler,
);
applicantEducationRouter.patch(
  '/:recordId',
  validateRequest({
    params: profileRecordParamsSchema,
    body: applicantEducationUpdateSchema,
  }),
  updateEducationHandler,
);
applicantEducationRouter.delete(
  '/:recordId',
  validateRequest({ params: profileRecordParamsSchema }),
  deleteEducationHandler,
);
