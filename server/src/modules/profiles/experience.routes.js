import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  addExperienceHandler,
  deleteExperienceHandler,
  updateExperienceHandler,
} from './experience.controller.js';
import {
  applicantExperienceCreateSchema,
  applicantExperienceUpdateSchema,
  profileRecordParamsSchema,
} from './profile.schemas.js';

export const applicantExperienceRouter = Router();

applicantExperienceRouter.use(requireAuth, requireRole('APPLICANT'));
applicantExperienceRouter.post(
  '/',
  validateRequest({ body: applicantExperienceCreateSchema }),
  addExperienceHandler,
);
applicantExperienceRouter.patch(
  '/:recordId',
  validateRequest({
    params: profileRecordParamsSchema,
    body: applicantExperienceUpdateSchema,
  }),
  updateExperienceHandler,
);
applicantExperienceRouter.delete(
  '/:recordId',
  validateRequest({ params: profileRecordParamsSchema }),
  deleteExperienceHandler,
);
