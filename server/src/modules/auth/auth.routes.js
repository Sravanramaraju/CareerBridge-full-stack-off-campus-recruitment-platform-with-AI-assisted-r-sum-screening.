import { Router } from 'express';
import { requireAuth } from '../../middleware/authorization.js';
import {
  authAccountRateLimit,
  passwordRecoveryRateLimit,
} from '../../middleware/rateLimits.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  applicantSignupHandler,
  currentUserHandler,
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  recruiterSignupHandler,
  resetPasswordHandler,
} from './auth.controller.js';
import {
  applicantSignupSchema,
  forgotPasswordSchema,
  loginSchema,
  recruiterSignupSchema,
  resetPasswordSchema,
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
authRouter.post(
  '/forgot-password',
  passwordRecoveryRateLimit,
  validateRequest({ body: forgotPasswordSchema }),
  forgotPasswordHandler,
);
authRouter.post(
  '/reset-password',
  passwordRecoveryRateLimit,
  validateRequest({ body: resetPasswordSchema }),
  resetPasswordHandler,
);
authRouter.get('/me', requireAuth, currentUserHandler);
authRouter.post('/logout', logoutHandler);
