import { Router } from 'express';
import { requireAuth } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { currentUserHandler, loginHandler } from './auth.controller.js';
import { loginSchema } from './auth.schemas.js';

export const authRouter = Router();

authRouter.post('/login', validateRequest({ body: loginSchema }), loginHandler);
authRouter.get('/me', requireAuth, currentUserHandler);
