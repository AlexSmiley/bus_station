import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import pino from 'pino';
import { createApp } from '../src/app.js';

const config = {
  NODE_ENV: 'test',
  CORS_ORIGIN: 'http://localhost:5173',
  RATE_LIMIT_WINDOW_MS: 60_000,
  RATE_LIMIT_MAX: 120
};
const logger = pino({ enabled: false });

function createTestApp(database = {
  enabled: false,
  async ping() { return { configured: false, connected: false }; }
}) {
  return createApp({ config, database, logger });
}

test('GET /health/live returns UP', async () => {
  const response = await request(createTestApp()).get('/health/live');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'UP' });
});

test('GET /api/v1/system/status identifies the Node.js API', async () => {
  const response = await request(createTestApp()).get('/api/v1/system/status');
  assert.equal(response.status, 200);
  assert.equal(response.body.application, 'bus-station-api');
  assert.equal(response.body.runtime, 'node.js');
  assert.equal(response.body.database, 'disabled');
});

test('GET /api/v1/system/ready returns dependency state', async () => {
  const response = await request(createTestApp()).get('/api/v1/system/ready');
  assert.equal(response.status, 200);
  assert.equal(response.body.database.connected, false);
});

test('readiness fails safely when Oracle is unavailable', async () => {
  const database = {
    enabled: true,
    async ping() { throw new Error('sensitive database details'); }
  };
  const response = await request(createTestApp(database)).get('/api/v1/system/ready');
  assert.equal(response.status, 503);
  assert.equal(response.body.error.message, 'A required dependency is unavailable.');
  assert.equal(JSON.stringify(response.body).includes('sensitive'), false);
});

test('unknown routes return a consistent 404 response', async () => {
  const response = await request(createTestApp()).get('/does-not-exist');
  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'NOT_FOUND');
});
