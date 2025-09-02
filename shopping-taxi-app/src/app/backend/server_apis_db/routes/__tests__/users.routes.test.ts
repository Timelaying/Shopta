import test from 'node:test';
import assert from 'node:assert';

process.env.DB_USER = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'testdb';
process.env.DB_PASSWORD = 'secret';
process.env.ACCESS_TOKEN_SECRET = 'access';
process.env.REFRESH_TOKEN_SECRET = 'refresh';

const usersRouter = (await import('../users.routes')).default;

test('users router defines POST /', () => {
  const layer = usersRouter.stack.find((l: any) => l.route?.path === '/');
  assert.ok(layer?.route.methods.post);
});

test('users router defines GET /:id', () => {
  const layer = usersRouter.stack.find((l: any) => l.route?.path === '/:id');
  assert.ok(layer?.route.methods.get);
});
