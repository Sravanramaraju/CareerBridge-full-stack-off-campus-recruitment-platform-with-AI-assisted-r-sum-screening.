import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
import { loginHandler } from './auth.controller.js';
import { loginSchema } from './auth.schemas.js';

export const authRouter = Router();

authRouter.post('/login', validateRequest({ body: loginSchema }), loginHandler);
