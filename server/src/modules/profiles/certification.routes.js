import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  addCertificationHandler,
  deleteCertificationHandler,
  updateCertificationHandler,
} from './certification.controller.js';
import {
  applicantCertificationCreateSchema,
  applicantCertificationUpdateSchema,
  profileRecordParamsSchema,
} from './profile.schemas.js';

export const applicantCertificationRouter = Router();

applicantCertificationRouter.use(requireAuth, requireRole('APPLICANT'));
applicantCertificationRouter.post(
  '/',
  validateRequest({ body: applicantCertificationCreateSchema }),
  addCertificationHandler,
);
applicantCertificationRouter.patch(
  '/:recordId',
  validateRequest({
    params: profileRecordParamsSchema,
    body: applicantCertificationUpdateSchema,
  }),
  updateCertificationHandler,
);
applicantCertificationRouter.delete(
  '/:recordId',
  validateRequest({ params: profileRecordParamsSchema }),
  deleteCertificationHandler,
);
