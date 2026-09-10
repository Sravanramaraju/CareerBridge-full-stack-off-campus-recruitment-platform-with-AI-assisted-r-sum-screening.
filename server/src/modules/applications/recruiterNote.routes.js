import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { recruiterNoteParamsSchema } from './application.schemas.js';
import { deleteRecruiterNoteHandler } from './recruiterNote.controller.js';

export const recruiterNoteRouter = Router();

recruiterNoteRouter.use(requireAuth, requireRole('RECRUITER'));
recruiterNoteRouter.delete(
  '/:noteId',
  validateRequest({ params: recruiterNoteParamsSchema }),
  deleteRecruiterNoteHandler,
);
