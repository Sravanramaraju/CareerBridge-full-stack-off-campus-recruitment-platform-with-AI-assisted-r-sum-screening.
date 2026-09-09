import { Router } from 'express';
import { requireAuth } from '../../middleware/authorization.js';
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

authRouter.post('/login', validateRequest({ body: loginSchema }), loginHandler);
authRouter.post(
  '/signup/applicant',
  validateRequest({ body: applicantSignupSchema }),
  applicantSignupHandler,
);
authRouter.post(
  '/signup/recruiter',
  validateRequest({ body: recruiterSignupSchema }),
  recruiterSignupHandler,
);
authRouter.get('/me', requireAuth, currentUserHandler);
authRouter.post('/logout', logoutHandler);
