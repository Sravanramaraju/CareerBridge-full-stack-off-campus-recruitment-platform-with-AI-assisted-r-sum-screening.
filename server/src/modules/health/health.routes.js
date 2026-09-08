import { Router } from 'express';

export function createHealthRouter({ databaseCheck = async () => ({ status: 'not-configured' }) } = {}) {
  const router = Router();

  router.get('/', async (_request, response) => {
    const database = await databaseCheck();
    response.json({
      data: {
        status: database.status === 'up' || database.status === 'not-configured' ? 'ok' : 'degraded',
        database,
        timestamp: new Date().toISOString(),
      },
    });
  });

  return router;
}
