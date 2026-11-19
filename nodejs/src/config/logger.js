import pino from 'pino';

export function createLogger(config) {
  return pino({
    level: config.LOG_LEVEL,
    redact: {
      paths: ['req.headers.authorization', 'ORACLE_PASSWORD', 'password'],
      censor: '[REDACTED]'
    }
  });
}
