import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { getSettingsHandler, updateSettingsHandler } from './settings.controller.js';
import { settingsUpdateSchema } from './settings.schemas.js';

export const settingsRouter = Router();

settingsRouter.use(requireAuth, requireRole('APPLICANT', 'RECRUITER'));
settingsRouter.get('/', getSettingsHandler);
settingsRouter.patch(
  '/',
  validateRequest({ body: settingsUpdateSchema }),
  updateSettingsHandler,
);
