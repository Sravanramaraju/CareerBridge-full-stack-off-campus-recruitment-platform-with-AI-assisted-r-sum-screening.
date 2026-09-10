import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  getRecruiterApplicationHandler,
  updateRecruiterApplicationStatusHandler,
} from './recruiterApplication.controller.js';
import {
  applicationParamsSchema,
  applicationStatusUpdateSchema,
  recruiterNoteCreateSchema,
} from './application.schemas.js';
import {
  addRecruiterNoteHandler,
  listRecruiterNotesHandler,
} from './recruiterNote.controller.js';

export const recruiterApplicationRouter = Router();

recruiterApplicationRouter.use(requireAuth, requireRole('RECRUITER'));
recruiterApplicationRouter.get(
  '/:applicationId',
  validateRequest({ params: applicationParamsSchema }),
  getRecruiterApplicationHandler,
);
recruiterApplicationRouter.patch(
  '/:applicationId/status',
  validateRequest({
    params: applicationParamsSchema,
    body: applicationStatusUpdateSchema,
  }),
  updateRecruiterApplicationStatusHandler,
);
recruiterApplicationRouter.get(
  '/:applicationId/notes',
  validateRequest({ params: applicationParamsSchema }),
  listRecruiterNotesHandler,
);
recruiterApplicationRouter.post(
  '/:applicationId/notes',
  validateRequest({ params: applicationParamsSchema, body: recruiterNoteCreateSchema }),
  addRecruiterNoteHandler,
);
