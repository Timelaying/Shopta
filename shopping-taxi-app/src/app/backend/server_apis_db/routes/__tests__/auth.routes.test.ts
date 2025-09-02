import test from 'node:test';
import assert from 'node:assert';

process.env.DB_USER = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'testdb';
process.env.DB_PASSWORD = 'secret';
process.env.ACCESS_TOKEN_SECRET = 'access';
process.env.REFRESH_TOKEN_SECRET = 'refresh';

const authRouter = (await import('../auth.routes')).default;

test('auth router includes login route', () => {
  const paths = authRouter.stack.filter((l: any) => l.route).map((l: any) => l.route.path);
  assert.ok(paths.includes('/login'));
});

test('auth router protects /me with jwtMiddleware', () => {
  const layer = authRouter.stack.find((l: any) => l.route?.path === '/me');
  assert.ok(layer, 'me route exists');
  const names = layer.route.stack.map((s: any) => s.name);
  assert.strictEqual(names[0], 'jwtMiddleware');
});
