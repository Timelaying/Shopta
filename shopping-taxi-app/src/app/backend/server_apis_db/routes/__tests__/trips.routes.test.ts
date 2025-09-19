import test from 'node:test';
import assert from 'node:assert';

process.env.DB_USER = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'testdb';
process.env.DB_PASSWORD = 'secret';
process.env.ACCESS_TOKEN_SECRET = 'access';
process.env.REFRESH_TOKEN_SECRET = 'refresh';

const tripsRouter = (await import('../trips.routes')).default;

test('trips router defines GET /stops/:stopId', () => {
  const layer = tripsRouter.stack.find((l: any) => l.route?.path === '/stops/:stopId');
  assert.ok(layer?.route.methods.get);
});

test('trips router defines GET /:id', () => {
  const layer = tripsRouter.stack.find((l: any) => l.route?.path === '/:id');
  assert.ok(layer?.route.methods.get);
});
