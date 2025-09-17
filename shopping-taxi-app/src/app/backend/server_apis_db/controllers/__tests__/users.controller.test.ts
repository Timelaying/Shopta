import test, { mock } from 'node:test';
import assert from 'node:assert';

process.env.DB_USER = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'testdb';
process.env.DB_PASSWORD = 'secret';
process.env.ACCESS_TOKEN_SECRET = 'access';
process.env.REFRESH_TOKEN_SECRET = 'refresh';

const pool = (await import('../../db.ts')).default;
const { createUser, getUser } = await import('../users.controller');

const createMockRes = () => {
  const res: any = {};
  res.status = mock.fn((code: number) => { res.statusCode = code; return res; });
  res.json = mock.fn((body: unknown) => { res.body = body; });
  return res;
};

const createMockClient = (user: any) => ({
  query: mock.fn(async (text: string) => {
    if (text.includes('SELECT id FROM users WHERE referral_code')) {
      return { rows: [] };
    }
    if (text.startsWith('INSERT INTO users')) {
      return { rows: [user] };
    }
    return { rows: [] };
  }),
  release: mock.fn(),
});

test('createUser responds with 400 if fields missing', async () => {
  const req: any = { body: { email: 'a@b.com', password: 'pw' } };
  const res = createMockRes();
  await createUser(req, res, () => {});
  assert.strictEqual(res.status.mock.calls[0].arguments[0], 400);
});

test('createUser stores user and returns 201', async () => {
  mock.restoreAll();
  const req: any = { body: { username: 'bob', email: 'b@e.com', password: 'pw' } };
  const res = createMockRes();
  const user = {
    id: 1,
    username: 'bob',
    email: 'b@e.com',
    role: 'customer',
    referral_code: 'ABC123',
    referral_points: 10,
    referred_by: null,
  };
  const client = createMockClient(user);
  mock.method(pool, 'connect', async () => client);
  await createUser(req, res, () => {});
  assert.strictEqual(res.status.mock.calls[0].arguments[0], 201);
  assert.deepStrictEqual(res.json.mock.calls[0].arguments[0], {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    referral: {
      code: user.referral_code,
      points: user.referral_points,
      referredBy: user.referred_by,
    },
  });
});

test('getUser responds with 404 if user not found', async () => {
  mock.restoreAll();
  const req: any = { params: { id: '1' } };
  const res = createMockRes();
  mock.method(pool, 'query', async () => ({ rows: [] }));
  await getUser(req, res, () => {});
  assert.strictEqual(res.status.mock.calls[0].arguments[0], 404);
});

test('getUser returns user when found', async () => {
  mock.restoreAll();
  const req: any = { params: { id: '1' } };
  const res = createMockRes();
  const user = { id: 1, username: 'bob', email: 'b@e.com' };
  mock.method(pool, 'query', async () => ({ rows: [user] }));
  await getUser(req, res, () => {});
  assert.deepStrictEqual(res.json.mock.calls[0].arguments[0], user);
});
