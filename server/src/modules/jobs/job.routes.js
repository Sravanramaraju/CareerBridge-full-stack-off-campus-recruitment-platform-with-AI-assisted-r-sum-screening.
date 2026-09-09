import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
import { listJobsHandler } from './job.controller.js';
import { publicJobListQuerySchema } from './job.schemas.js';

export const jobRouter = Router();

jobRouter.get('/', validateRequest({ query: publicJobListQuerySchema }), listJobsHandler);
