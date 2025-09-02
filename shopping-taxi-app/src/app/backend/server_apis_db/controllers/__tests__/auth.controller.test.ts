import test, { mock } from 'node:test';
import assert from 'node:assert';

process.env.DB_USER = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'testdb';
process.env.DB_PASSWORD = 'secret';
process.env.ACCESS_TOKEN_SECRET = 'access';
process.env.REFRESH_TOKEN_SECRET = 'refresh';

const pool = (await import('../../db.ts')).default;
const bcrypt = await import('bcryptjs');
const { register, login } = await import('../auth.controller');

const createMockRes = () => {
  const res: any = {};
  res.status = mock.fn((code: number) => { res.statusCode = code; return res; });
  res.json = mock.fn((body: unknown) => { res.body = body; return res; });
  res.cookie = mock.fn(() => res);
  return res;
};

test('register responds with 400 if fields missing', async () => {
  const req: any = { body: { email: 'e@x.com', password: 'pw' } };
  const res = createMockRes();
  await register(req, res, () => {});
  assert.strictEqual(res.status.mock.calls[0].arguments[0], 400);
});

test('login responds with 401 if user not found', async () => {
  mock.restoreAll();
  const req: any = { body: { email: 'e@x.com', password: 'pw' }, cookies: {} };
  const res = createMockRes();
  mock.method(pool, 'query', async () => ({ rows: [] }));
  await login(req, res, () => {});
  assert.strictEqual(res.status.mock.calls[0].arguments[0], 401);
});

