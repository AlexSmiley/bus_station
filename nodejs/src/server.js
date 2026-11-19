import 'dotenv/config';
import { loadConfig } from './config/env.js';
import { createLogger } from './config/logger.js';
import { createOracleDatabase } from './database/oracle.js';
import { createApp } from './app.js';

const config = loadConfig();
const logger = createLogger(config);
const database = createOracleDatabase(config, logger);
const app = createApp({ config, database, logger });

let server;
let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Shutting down');
  try {
    if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await database.close();
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Shutdown failed');
    process.exit(1);
  }
}

try {
  await database.connect();
  server = app.listen(config.PORT, () => {
    logger.info({ port: config.PORT, environment: config.NODE_ENV }, 'Bus Station API started');
  });
} catch (error) {
  logger.fatal({ err: error }, 'Application startup failed');
  process.exit(1);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
