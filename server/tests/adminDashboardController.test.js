import { describe, expect, it, vi } from 'vitest';
import { createGetAdminDashboardHandler } from '../src/modules/admin/admin.controller.js';

describe('admin dashboard controller', () => {
  it('returns the real dashboard service response', async () => {
    const data = { metrics: { totalUsers: 100 }, recentModeration: [] };
    const loadDashboard = vi.fn().mockResolvedValue(data);
    const response = { json: vi.fn((value) => value) };
    await createGetAdminDashboardHandler({ loadDashboard })({}, response, vi.fn());
    expect(loadDashboard).toHaveBeenCalledOnce();
    expect(response.json).toHaveBeenCalledWith({ data });
  });

  it('forwards dashboard failures to centralized error handling', async () => {
    const error = new Error('database unavailable');
    const next = vi.fn();
    await createGetAdminDashboardHandler({
      loadDashboard: vi.fn().mockRejectedValue(error),
    })({}, { json: vi.fn() }, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
