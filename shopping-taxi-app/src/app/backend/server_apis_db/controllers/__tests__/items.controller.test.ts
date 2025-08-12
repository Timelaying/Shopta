import test, { mock } from 'node:test';
import assert from 'node:assert';

process.env.DB_USER = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'testdb';
process.env.DB_PASSWORD = 'secret';

const pool = (await import('../../db.ts')).default;
const { createItem, getAllItems } = await import('../items.controller.ts');

const createMockRes = () => {
  const res: any = {};
  res.status = mock.fn((code: number) => { res.statusCode = code; return res; });
  res.json = mock.fn((body: unknown) => { res.body = body; });
  return res;
};

test('createItem responds with 400 if name missing', async () => {
  const req: any = { body: { category: 'fruit' } };
  const res = createMockRes();
  await createItem(req, res, () => {});
  assert.strictEqual(res.status.mock.calls[0].arguments[0], 400);
});

test('createItem stores item and returns 201', async () => {
  const req: any = { body: { name: 'Apple', category: 'fruit' } };
  const res = createMockRes();
  const item = { id: 1, name: 'Apple', category: 'fruit' };
  mock.method(pool, 'query', async () => ({ rows: [item] }));
  await createItem(req, res, () => {});
  assert.strictEqual(res.status.mock.calls[0].arguments[0], 201);
  assert.deepStrictEqual(res.json.mock.calls[0].arguments[0], item);
});

test('getAllItems returns list of items', async () => {
  const req: any = {};
  const res = createMockRes();
  const items = [{ id: 1, name: 'Apple' }];
  mock.method(pool, 'query', async () => ({ rows: items }));
  await getAllItems(req, res, () => {});
  assert.deepStrictEqual(res.json.mock.calls[0].arguments[0], items);
});
