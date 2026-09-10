import { describe, expect, it, vi } from 'vitest';
import { createNotificationRecords } from '../src/modules/notifications/notification.repository.js';

describe('notification repository', () => {
  it('creates a focused batch of user-owned notifications', async () => {
    const createMany = vi.fn().mockResolvedValue({ count: 2 });
    const notifications = [
      {
        userId: 'applicant-1',
        type: 'APPLICATION_SUBMITTED',
        title: 'Application submitted',
        message: 'Your application was submitted.',
        entityType: 'APPLICATION',
        entityId: 'application-1',
      },
      {
        userId: 'recruiter-1',
        type: 'APPLICATION_RECEIVED',
        title: 'New application',
        message: 'A candidate applied to your role.',
        entityType: 'APPLICATION',
        entityId: 'application-1',
      },
    ];

    await createNotificationRecords(notifications, { notification: { createMany } });
    expect(createMany).toHaveBeenCalledWith({ data: notifications });
  });

  it('skips empty notification batches', async () => {
    await expect(createNotificationRecords([], {})).resolves.toEqual({ count: 0 });
  });
});
