import { z } from 'zod';

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {\n    if (value.toLowerCase() === 'true') return true;\n    if (value.toLowerCase() === 'false') return false;\n  }
  return false;
}, z.boolean());

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  DB_ENABLED: booleanFromEnv.default(false),
  ORACLE_USER: z.string().default(''),
  ORACLE_PASSWORD: z.string().default(''),
  ORACLE_CONNECT_STRING: z.string().default(''),
  ORACLE_POOL_MIN: z.coerce.number().int().min(0).default(1),
  ORACLE_POOL_MAX: z.coerce.number().int().positive().default(10),
  ORACLE_POOL_INCREMENT: z.coerce.number().int().positive().default(1)
}).superRefine((env, context) => {
  if (env.DB_ENABLED) {
    for (const key of ['ORACLE_USER', 'ORACLE_PASSWORD', 'ORACLE_CONNECT_STRING']) {
      if (!env[key]) {
        context.addIssue({ code: 'custom', path: [key], message: `${key} is required when DB_ENABLED=true` });
      }
    }
    if (env.ORACLE_POOL_MIN > env.ORACLE_POOL_MAX) {
      context.addIssue({ code: 'custom', path: ['ORACLE_POOL_MIN'], message: 'Must not exceed ORACLE_POOL_MAX' });
    }
  }
});

export function loadConfig(source = process.env) {
  const result = schema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return Object.freeze(result.data);
}
