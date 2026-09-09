import { describe, expect, it, vi } from 'vitest';
import { createEmailWorker } from '../src/modules/email/emailWorker.js';

describe('email worker scheduler', () => {
  it('prevents overlapping outbox batches', async () => {
    let finishBatch;
    const processBatch = vi.fn(
      () => new Promise((resolve) => {
        finishBatch = resolve;
      }),
    );
    const worker = createEmailWorker({ processBatch, workerLogger: { info: vi.fn(), error: vi.fn() } });

    const first = worker.runNow();
    const second = worker.runNow();
    expect(processBatch).toHaveBeenCalledTimes(1);

    finishBatch({ found: 1, sent: 1, retried: 0, failed: 0 });
    await Promise.all([first, second]);
  });

  it('contains batch failures so the scheduler can continue', async () => {
    const error = vi.fn();
    const worker = createEmailWorker({
      processBatch: vi.fn().mockRejectedValue(new Error('database unavailable')),
      workerLogger: { info: vi.fn(), error },
    });

    await expect(worker.runNow()).resolves.toEqual({ found: 0, sent: 0, retried: 0, failed: 0 });
    expect(error).toHaveBeenCalledOnce();
  });
});
