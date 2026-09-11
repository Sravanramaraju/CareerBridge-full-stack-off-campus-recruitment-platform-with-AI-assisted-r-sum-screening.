import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiClient = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }));
vi.mock('@/src/services/apiClient', () => ({ apiClient }));

import { notificationsService } from '@/src/services/notificationsService';

describe('notificationsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads a paginated notification inbox', async () => {
    await notificationsService.getNotifications({ page: 2, pageSize: 10, unreadOnly: true });
    expect(apiClient.get).toHaveBeenCalledWith(
      '/notifications?page=2&pageSize=10&unreadOnly=true', undefined,
    );
  });

  it('marks one or every notification read', async () => {
    await notificationsService.markRead('notification/1');
    await notificationsService.markAllRead();
    expect(apiClient.patch).toHaveBeenNthCalledWith(
      1, '/notifications/notification%2F1/read', undefined, undefined,
    );
    expect(apiClient.patch).toHaveBeenNthCalledWith(
      2, '/notifications/read-all', undefined, undefined,
    );
  });
});
