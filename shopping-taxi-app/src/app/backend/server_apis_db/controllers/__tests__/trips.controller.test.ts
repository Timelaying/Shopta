import test, { mock } from 'node:test';
import assert from 'node:assert';

process.env.DB_USER = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'testdb';
process.env.DB_PASSWORD = 'secret';
process.env.ACCESS_TOKEN_SECRET = 'access';
process.env.REFRESH_TOKEN_SECRET = 'refresh';

const pool = (await import('../../db.ts')).default;
const { getTripById, getTripStop } = await import('../trips.controller.ts');

const createMockRes = () => {
  const res: any = {};
  res.status = mock.fn((code: number) => { res.statusCode = code; return res; });
  res.json = mock.fn((body: unknown) => { res.body = body; });
  return res;
};

test('getTripById returns trip with formatted stops', async () => {
  mock.restoreAll();
  const req: any = { params: { id: '42' } };
  const res = createMockRes();
  const tripRow = {
    id: 42,
    user_id: 7,
    created_at: '2024-01-01T00:00:00.000Z',
    vehicle_size: 'standard',
  };
  const stopRow = {
    id: 1,
    trip_id: 42,
    store_id: 9,
    visited: false,
    sequence: 1,
    store_name: 'Fresh Mart',
    store_address: '123 Main',
    latitude: 1.23,
    longitude: 4.56,
  };
  mock.method(pool, 'query', async (text: string) => {
    if (text.startsWith('SELECT * FROM trips WHERE id = $1')) {
      return { rows: [tripRow] };
    }
    if (text.includes('FROM trip_stops') && text.includes('trip_id')) {
      return { rows: [stopRow] };
    }
    throw new Error(`Unexpected query: ${text}`);
  });
  await getTripById(req, res, () => {});
  assert.deepStrictEqual(res.json.mock.calls[0].arguments[0], {
    id: 42,
    user_id: 7,
    vehicle_size: 'standard',
    created_at: '2024-01-01T00:00:00.000Z',
    stops: [
      {
        id: 1,
        trip_id: 42,
        store_id: 9,
        visited: false,
        sequence: 1,
        name: 'Fresh Mart',
        address: '123 Main',
        latitude: 1.23,
        longitude: 4.56,
      },
    ],
  });
});

test('getTripById responds with 404 when trip is missing', async () => {
  mock.restoreAll();
  const req: any = { params: { id: '55' } };
  const res = createMockRes();
  mock.method(pool, 'query', async (text: string) => {
    if (text.startsWith('SELECT * FROM trips WHERE id = $1')) {
      return { rows: [] };
    }
    throw new Error(`Unexpected query: ${text}`);
  });
  await getTripById(req, res, () => {});
  assert.strictEqual(res.status.mock.calls[0].arguments[0], 404);
  assert.deepStrictEqual(res.json.mock.calls[0].arguments[0], { error: 'Trip not found' });
});

test('getTripById validates the identifier', async () => {
  mock.restoreAll();
  const req: any = { params: { id: 'abc' } };
  const res = createMockRes();
  mock.method(pool, 'query', async () => { throw new Error('should not be called'); });
  await getTripById(req, res, () => {});
  assert.strictEqual(res.status.mock.calls[0].arguments[0], 400);
  assert.deepStrictEqual(res.json.mock.calls[0].arguments[0], { error: 'Invalid trip id' });
});

test('getTripStop returns stop with coordinates and metadata', async () => {
  mock.restoreAll();
  const req: any = { params: { stopId: '9' } };
  const res = createMockRes();
  const stop = {
    id: 9,
    trip_id: 3,
    store_id: 11,
    visited: true,
    sequence: 2,
    store_name: 'Corner Shop',
    store_address: '456 Side St',
    latitude: 7.89,
    longitude: -1.23,
  };
  mock.method(pool, 'query', async (text: string) => {
    if (text.includes('WHERE ts.id = $1')) {
      return { rows: [stop] };
    }
    throw new Error(`Unexpected query: ${text}`);
  });
  await getTripStop(req, res, () => {});
  assert.deepStrictEqual(res.json.mock.calls[0].arguments[0], {
    id: 9,
    trip_id: 3,
    store_id: 11,
    visited: true,
    sequence: 2,
    name: 'Corner Shop',
    address: '456 Side St',
    coords: [7.89, -1.23],
    latitude: 7.89,
    longitude: -1.23,
  });
});

test('getTripStop responds with 404 when stop not found', async () => {
  mock.restoreAll();
  const req: any = { params: { stopId: '9' } };
  const res = createMockRes();
  mock.method(pool, 'query', async (text: string) => {
    if (text.includes('WHERE ts.id = $1')) {
      return { rows: [] };
    }
    throw new Error(`Unexpected query: ${text}`);
  });
  await getTripStop(req, res, () => {});
  assert.strictEqual(res.status.mock.calls[0].arguments[0], 404);
  assert.deepStrictEqual(res.json.mock.calls[0].arguments[0], { error: 'Trip stop not found' });
});

test('getTripStop validates the stop identifier', async () => {
  mock.restoreAll();
  const req: any = { params: { stopId: 'oops' } };
  const res = createMockRes();
  mock.method(pool, 'query', async () => { throw new Error('should not be called'); });
  await getTripStop(req, res, () => {});
  assert.strictEqual(res.status.mock.calls[0].arguments[0], 400);
  assert.deepStrictEqual(res.json.mock.calls[0].arguments[0], { error: 'Invalid stop id' });
});
