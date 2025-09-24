import test, { mock } from 'node:test';
import assert from 'node:assert';

process.env.DB_USER = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'testdb';
process.env.DB_PASSWORD = 'secret';
process.env.ACCESS_TOKEN_SECRET = 'access';
process.env.REFRESH_TOKEN_SECRET = 'refresh';

const pool = (await import('../../db.ts')).default;
const { createTrip, getTripById, getTripStop } = await import('../trips.controller.ts');
const { VEHICLE_STOP_LIMITS, MIN_STOPS_PER_TRIP } = await import('../../../../shared/tripLimits.ts');

const createMockRes = () => {
  const res: any = {};
  res.status = mock.fn((code: number) => { res.statusCode = code; return res; });
  res.json = mock.fn((body: unknown) => { res.body = body; });
  return res;
};

test('createTrip rejects requests exceeding the per-vehicle stop limit', async () => {
  mock.restoreAll();
  const poolQueryMock = mock.method(pool, 'query', async () => {
    throw new Error('pool.query should not be called when validation fails');
  });
  const req: any = {
    user: { id: 1 },
    body: {
      vehicleSize: 'small',
      stops: Array.from({ length: VEHICLE_STOP_LIMITS.small + 1 }, (_, index) => ({
        store_id: index + 1,
        sequence: index + 1,
      })),
    },
  };
  const res = createMockRes();

  await createTrip(req, res, () => {});

  assert.strictEqual(res.status.mock.calls[0].arguments[0], 400);
  assert.deepStrictEqual(res.json.mock.calls[0].arguments[0], {
    error: `Stops must be between ${MIN_STOPS_PER_TRIP} and ${VEHICLE_STOP_LIMITS.small}`,
  });
  assert.strictEqual(poolQueryMock.mock.calls.length, 0);
  mock.restoreAll();
});

test('createTrip allows stop counts at the vehicle limit', async () => {
  mock.restoreAll();
  const limit = VEHICLE_STOP_LIMITS.large;
  const req: any = {
    user: { id: 9 },
    body: {
      vehicleSize: 'large',
      stops: Array.from({ length: limit }, (_, index) => ({
        store_id: index + 100,
        sequence: index + 1,
      })),
    },
  };
  const res = createMockRes();

  const stopInserts: Array<[number, number, number]> = [];
  const poolQueryMock = mock.method(pool, 'query', async (text: string, params?: any[]) => {
    if (text.startsWith('INSERT INTO trips')) {
      return {
        rows: [
          {
            id: 77,
            user_id: req.user.id,
            vehicle_size: req.body.vehicleSize,
            created_at: '2024-06-01T00:00:00.000Z',
          },
        ],
      };
    }
    if (text.startsWith('INSERT INTO trip_stops')) {
      stopInserts.push(params as [number, number, number]);
      return { rows: [] };
    }
    if (text.includes("FROM users") && text.includes("role = 'driver'")) {
      return { rows: [{ id: 42, username: 'Driver Dan' }] };
    }
    throw new Error(`Unexpected query: ${text}`);
  });

  await createTrip(req, res, () => {});

  assert.strictEqual(res.status.mock.calls[0].arguments[0], 201);
  assert.deepStrictEqual(res.json.mock.calls[0].arguments[0], {
    tripId: 77,
    driver: { id: 42, username: 'Driver Dan' },
    eta: 5,
  });
  assert.strictEqual(stopInserts.length, limit);
  stopInserts.forEach(([tripId, storeId, sequence], index) => {
    assert.strictEqual(tripId, 77);
    assert.strictEqual(storeId, req.body.stops[index].store_id);
    assert.strictEqual(sequence, req.body.stops[index].sequence);
  });
  assert.ok(poolQueryMock.mock.calls.length >= limit + 2);
  mock.restoreAll();
});

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
