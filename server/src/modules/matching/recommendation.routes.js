import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { getRecommendationsHandler } from './recommendation.controller.js';
import { recommendationQuerySchema } from './recommendation.schemas.js';

export const recommendationRouter = Router();

recommendationRouter.use(requireAuth, requireRole('APPLICANT'));
recommendationRouter.get(
  '/',
  validateRequest({ query: recommendationQuerySchema }),
  getRecommendationsHandler,
);
