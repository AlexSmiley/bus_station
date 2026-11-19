import { Router } from 'express';

export function createSystemRouter(database) {
  const router = Router();

  /**
   * @openapi
   * /api/v1/system/status:
   *   get:
   *     summary: Application status
   *     tags: [System]
   *     responses:
   *       200:
   *         description: Application status and database configuration state.
   */
  router.get('/status', (_request, response) => {
    response.json({
      application: 'bus-station-api',
      runtime: 'node.js',
      status: 'UP',
      database: database.enabled ? 'configured' : 'disabled'
    });
  });

  /**
   * @openapi
   * /api/v1/system/ready:
   *   get:
   *     summary: Readiness check
   *     tags: [System]
   *     responses:
   *       200:
   *         description: Service is ready.
   *       503:
   *         description: Required dependencies are unavailable.
   */
  router.get('/ready', async (_request, response, next) => {
    try {
      const databaseStatus = await database.ping();
      response.json({ status: 'UP', database: databaseStatus });
    } catch (error) {
      next(Object.assign(new Error('A required dependency is unavailable.'), {
        status: 503,
        code: 'DEPENDENCY_UNAVAILABLE',
        cause: error
      }));
    }
  });

  return router;
}
