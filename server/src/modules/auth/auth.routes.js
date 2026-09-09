import { Router } from 'express';
import { requireAuth } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  applicantSignupHandler,
  currentUserHandler,
  loginHandler,
  logoutHandler,
} from './auth.controller.js';
import { applicantSignupSchema, loginSchema } from './auth.schemas.js';

export const authRouter = Router();

authRouter.post('/login', validateRequest({ body: loginSchema }), loginHandler);
authRouter.post(
  '/signup/applicant',
  validateRequest({ body: applicantSignupSchema }),
  applicantSignupHandler,
);
authRouter.get('/me', requireAuth, currentUserHandler);
authRouter.post('/logout', logoutHandler);
