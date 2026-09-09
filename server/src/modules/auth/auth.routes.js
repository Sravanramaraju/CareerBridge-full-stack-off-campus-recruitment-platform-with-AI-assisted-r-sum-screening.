import { Router } from 'express';
import { requireAuth } from '../../middleware/authorization.js';
import { authAccountRateLimit } from '../../middleware/rateLimits.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  applicantSignupHandler,
  currentUserHandler,
  loginHandler,
  logoutHandler,
  recruiterSignupHandler,
} from './auth.controller.js';
import {
  applicantSignupSchema,
  loginSchema,
  recruiterSignupSchema,
} from './auth.schemas.js';

export const authRouter = Router();

authRouter.post('/login', authAccountRateLimit, validateRequest({ body: loginSchema }), loginHandler);
authRouter.post(
  '/signup/applicant',
  authAccountRateLimit,
  validateRequest({ body: applicantSignupSchema }),
  applicantSignupHandler,
);
authRouter.post(
  '/signup/recruiter',
  authAccountRateLimit,
  validateRequest({ body: recruiterSignupSchema }),
  recruiterSignupHandler,
);
authRouter.get('/me', requireAuth, currentUserHandler);
authRouter.post('/logout', logoutHandler);
