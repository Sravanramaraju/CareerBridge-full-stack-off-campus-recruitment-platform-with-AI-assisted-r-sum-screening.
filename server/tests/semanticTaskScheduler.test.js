import { describe, expect, it, vi } from 'vitest';
import { scheduleSemanticTask } from '../src/modules/matching/semanticTaskScheduler.js';

describe('semantic task scheduler', () => {
  it('runs successful tasks without blocking a caller contract', async () => {
    const operation = vi.fn().mockResolvedValue({ updated: true });
    await expect(scheduleSemanticTask(operation, { resumeId: 'resume-1' }))
      .resolves.toEqual({ updated: true });
    expect(operation).toHaveBeenCalledOnce();
  });

  it('contains background failures and records safe task context', async () => {
    const warn = vi.fn();
    await expect(scheduleSemanticTask(
      () => Promise.reject(new Error('model unavailable')),
      { jobId: 'job-1' },
      { semanticLogger: { warn } },
    )).resolves.toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.objectContaining({
      err: expect.any(Error), jobId: 'job-1',
    }), expect.stringContaining('on-demand regeneration'));
  });
});
