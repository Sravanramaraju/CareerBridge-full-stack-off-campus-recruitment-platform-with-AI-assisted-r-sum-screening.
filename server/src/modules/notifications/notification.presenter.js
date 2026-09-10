export function toNotification(notification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    entityType: notification.entityType,
    entityId: notification.entityId,
    readAt: notification.readAt,
    isRead: notification.readAt !== null,
    createdAt: notification.createdAt,
  };
}
