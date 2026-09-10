import { describe, expect, it } from 'vitest';
import {
  notificationListQuerySchema,
  notificationParamsSchema,
} from '../src/modules/notifications/notification.schemas.js';

describe('notification schemas', () => {
  it('applies bounded notification pagination defaults', () => {
    expect(notificationListQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 });
    expect(notificationListQuerySchema.parse({ page: '2', pageSize: '50' }))
      .toEqual({ page: 2, pageSize: 50 });
    expect(notificationListQuerySchema.safeParse({ pageSize: '51' }).success).toBe(false);
  });

  it('parses explicit unread filters without truthy string coercion', () => {
    expect(notificationListQuerySchema.parse({ unreadOnly: 'true' }).unreadOnly).toBe(true);
    expect(notificationListQuerySchema.parse({ unreadOnly: 'false' }).unreadOnly).toBe(false);
  });

  it('rejects role selection because authorization comes from the session', () => {
    expect(notificationListQuerySchema.safeParse({ role: 'ADMIN' }).success).toBe(false);
  });

  it('validates notification resource identifiers', () => {
    expect(notificationParamsSchema.parse({ notificationId: 'notification-1' }))
      .toEqual({ notificationId: 'notification-1' });
    expect(notificationParamsSchema.safeParse({ notificationId: '' }).success).toBe(false);
  });
});
