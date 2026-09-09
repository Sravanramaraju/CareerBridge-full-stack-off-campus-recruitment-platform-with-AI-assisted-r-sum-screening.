import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { applicantSkillsReplaceSchema } from './profile.schemas.js';
import { replaceApplicantSkillsHandler } from './skill.controller.js';

export const applicantSkillRouter = Router();

applicantSkillRouter.use(requireAuth, requireRole('APPLICANT'));
applicantSkillRouter.put(
  '/',
  validateRequest({ body: applicantSkillsReplaceSchema }),
  replaceApplicantSkillsHandler,
);
