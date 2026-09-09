import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  addProjectHandler,
  deleteProjectHandler,
  updateProjectHandler,
} from './project.controller.js';
import {
  applicantProjectCreateSchema,
  applicantProjectUpdateSchema,
  profileRecordParamsSchema,
} from './profile.schemas.js';

export const applicantProjectRouter = Router();

applicantProjectRouter.use(requireAuth, requireRole('APPLICANT'));
applicantProjectRouter.post(
  '/',
  validateRequest({ body: applicantProjectCreateSchema }),
  addProjectHandler,
);
applicantProjectRouter.patch(
  '/:recordId',
  validateRequest({
    params: profileRecordParamsSchema,
    body: applicantProjectUpdateSchema,
  }),
  updateProjectHandler,
);
applicantProjectRouter.delete(
  '/:recordId',
  validateRequest({ params: profileRecordParamsSchema }),
  deleteProjectHandler,
);
