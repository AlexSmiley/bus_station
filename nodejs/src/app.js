import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import pinoHttp from 'pino-http';
import { createSystemRouter } from './routes/system.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

export function createApp({ config, database, logger }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(pinoHttp({ logger }));
  app.use(helmet());
  app.use(cors({
    origin: config.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    limit: config.RATE_LIMIT_MAX,
    standardHeaders: 'draft-8',
    legacyHeaders: false
  }));

  app.get('/health/live', (_request, response) => response.json({ status: 'UP' }));
  app.use('/api/v1/system', createSystemRouter(database));

  const openApiSpec = swaggerJsdoc({
    definition: {
      openapi: '3.0.3',
      info: { title: 'Bus Station API', version: '1.0.0' },
      servers: [{ url: '/' }]
    },
    apis: ['./src/routes/*.js']
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use(notFoundHandler);
  app.use((error, request, response, next) => {
    logger.error({ err: error, method: request.method, path: request.path }, 'Request failed');
    errorHandler(error, request, response, next);
  });

  return app;
}
