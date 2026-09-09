import { describe, expect, it, vi } from 'vitest';
import {
  findOrCreateUserPreferences,
  updateUserPreferences,
} from '../src/modules/settings/settings.repository.js';

describe('settings repository', () => {
  it('creates default preferences on the first read', async () => {
    const upsert = vi.fn().mockResolvedValue({ applicationUpdates: true });

    await findOrCreateUserPreferences('user-1', { userPreference: { upsert } });

    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 'user-1' },
      create: { userId: 'user-1' },
      update: {},
    }));
  });

  it('upserts partial preference changes', async () => {
    const upsert = vi.fn().mockResolvedValue({ weeklySummary: true });

    await updateUserPreferences(
      'user-1',
      { weeklySummary: true },
      { userPreference: { upsert } },
    );

    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 'user-1' },
      create: { userId: 'user-1', weeklySummary: true },
      update: { weeklySummary: true },
    }));
    expect(upsert.mock.calls[0][0].select).not.toHaveProperty('userId');
  });
});
