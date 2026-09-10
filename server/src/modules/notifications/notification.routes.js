import { Router } from 'express';
import { requireAuth } from '../../middleware/authorization.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  listNotificationsHandler,
  readAllNotificationsHandler,
  readNotificationHandler,
} from './notification.controller.js';
import {
  notificationListQuerySchema,
  notificationParamsSchema,
} from './notification.schemas.js';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get(
  '/',
  validateRequest({ query: notificationListQuerySchema }),
  listNotificationsHandler,
);
notificationRouter.patch('/read-all', readAllNotificationsHandler);
notificationRouter.patch(
  '/:notificationId/read',
  validateRequest({ params: notificationParamsSchema }),
  readNotificationHandler,
);
