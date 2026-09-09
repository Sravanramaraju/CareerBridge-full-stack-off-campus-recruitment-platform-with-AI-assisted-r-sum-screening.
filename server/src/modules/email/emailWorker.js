import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { processEmailBatch } from './emailWorker.service.js';

export function createEmailWorker({
  processBatch = processEmailBatch,
  intervalMs = env.EMAIL_WORKER_INTERVAL_MS,
  workerLogger = logger,
} = {}) {
  let timer;
  let inFlight;

  async function runNow() {
    if (inFlight) return inFlight;

    inFlight = processBatch()
      .then((result) => {
        if (result.sent || result.retried || result.failed) {
          workerLogger.info(result, 'Email outbox batch completed');
        }
        return result;
      })
      .catch((error) => {
        workerLogger.error({ err: error }, 'Email outbox batch failed');
        return { found: 0, sent: 0, retried: 0, failed: 0 };
      })
      .finally(() => {
        inFlight = undefined;
      });

    return inFlight;
  }

  function start() {
    if (timer) return;
    timer = setInterval(() => void runNow(), intervalMs);
    timer.unref();
    void runNow();
  }

  async function stop() {
    if (timer) clearInterval(timer);
    timer = undefined;
    await inFlight;
  }

  return { runNow, start, stop };
}

export const emailWorker = createEmailWorker();
