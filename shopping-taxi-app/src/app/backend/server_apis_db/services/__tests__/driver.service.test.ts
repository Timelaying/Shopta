import test, { mock } from 'node:test';
import assert from 'node:assert';

// Set required environment variables before importing modules
process.env.DB_USER = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'testdb';
process.env.DB_PASSWORD = 'secret';

const pool = (await import('../../db.ts')).default;
const { matchDriverToTrip, estimateArrival } = await import('../driver.service.ts');

test('matchDriverToTrip returns first available driver', async () => {
  const driver = { id: 7, username: 'alice' };
  mock.method(pool, 'query', async () => ({ rows: [driver] }));
  const result = await matchDriverToTrip(123);
  assert.deepStrictEqual(result, driver);
});

test('matchDriverToTrip returns null when no driver found', async () => {
  mock.method(pool, 'query', async () => ({ rows: [] }));
  const result = await matchDriverToTrip(123);
  assert.strictEqual(result, null);
});

test('estimateArrival returns placeholder ETA', async () => {
  const eta = await estimateArrival(1, 2);
  assert.strictEqual(eta, 5);
});
