import { describe, expect, it, vi } from 'vitest';

const apiClient = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }));
vi.mock('@/src/services/apiClient', () => ({ apiClient }));

import { settingsService } from '@/src/services/settingsService';

describe('settingsService', () => {
  it('loads and updates account preferences', async () => {
    await settingsService.getSettings({ signal: 'signal' });
    await settingsService.updateSettings({ weeklySummary: true });
    expect(apiClient.get).toHaveBeenCalledWith('/settings', { signal: 'signal' });
    expect(apiClient.patch).toHaveBeenCalledWith('/settings', { weeklySummary: true }, undefined);
  });
});
