import { logger } from '../../lib/logger.js';

export function scheduleSemanticTask(
  operation,
  context,
  { semanticLogger = logger } = {},
) {
  return Promise.resolve()
    .then(operation)
    .catch((error) => {
      semanticLogger.warn({ err: error, ...context },
        'Background semantic task failed; on-demand regeneration remains available');
      return null;
    });
}
