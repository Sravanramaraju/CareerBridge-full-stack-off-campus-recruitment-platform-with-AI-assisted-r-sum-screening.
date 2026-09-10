import {
  getUserNotifications,
  readAllUserNotifications,
  readUserNotification,
} from './notification.service.js';

export function createListNotificationsHandler({ listNotifications = getUserNotifications } = {}) {
  return async (request, response, next) => {
    try {
      const result = await listNotifications(request.auth.user.id, request.validated.query);
      return response.json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export function createReadNotificationHandler({ readNotification = readUserNotification } = {}) {
  return async (request, response, next) => {
    try {
      const notification = await readNotification(
        request.auth.user.id,
        request.validated.params.notificationId,
      );
      return response.json({ data: notification });
    } catch (error) {
      return next(error);
    }
  };
}

export function createReadAllNotificationsHandler({
  readAllNotifications = readAllUserNotifications,
} = {}) {
  return async (request, response, next) => {
    try {
      const result = await readAllNotifications(request.auth.user.id);
      return response.json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export const listNotificationsHandler = createListNotificationsHandler();
export const readNotificationHandler = createReadNotificationHandler();
export const readAllNotificationsHandler = createReadAllNotificationsHandler();
