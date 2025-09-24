import test, { mock } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const filePath = path.join(process.cwd(), 'shopping-taxi-app/src/app/Frontend/Customer/TripPlanner/page.tsx');
const content = fs.readFileSync(filePath, 'utf8');

test('TripPlanner page contains expected headings', () => {
  assert.ok(content.includes('Select Stops'));
  assert.ok(content.includes('Vehicle Size'));
});

test('submitTrip posts stops with real store ids', async () => {
  const TripPlannerModule = await import('../tripPlannerUtils.ts');
  const apiClient = (await import('../../../../services/apiClient.ts')).default;
  const postMock = mock.method(apiClient, 'post', async (url, payload, config) => {
    assert.strictEqual(url, '/trips');
    assert.deepStrictEqual(payload, {
      stops: [{ store_id: 42, sequence: 1 }],
      vehicleSize: 'standard',
    });
    assert.strictEqual(config?.withCredentials, true);
    return { data: { tripId: 77 } } as const;
  });

  const stops: TripPlannerModule.Stop[] = [
    {
      id: 'place-1',
      description: '123 Main St, City',
      location: { lat: 10, lng: 20 },
      storeId: 42,
      storeName: 'Test Store',
      storeAddress: '123 Main St, City',
    },
  ];
  const pushed: string[] = [];
  const result = await TripPlannerModule.submitTrip(stops, 'standard', {
    push: (href: string) => {
      pushed.push(href);
    },
  });

  assert.deepStrictEqual(result, { tripId: 77 });
  assert.deepStrictEqual(pushed, ['/Frontend/Customer/Trips/77']);
  assert.strictEqual(postMock.mock.calls.length, 1);
  postMock.mock.restore();
});

test('submitTrip rejects when stops exceed the vehicle limit', async () => {
  const TripPlannerModule = await import('../tripPlannerUtils.ts');
  const { VEHICLE_STOP_LIMITS } = await import('../../../../shared/tripLimits.ts');
  const apiClient = (await import('../../../../services/apiClient.ts')).default;
  const postMock = mock.method(apiClient, 'post', async () => {
    throw new Error('API should not be called when stop limit is exceeded');
  });

  const vehicleSize = 'standard';
  const maxStops = VEHICLE_STOP_LIMITS[vehicleSize];
  const stops: TripPlannerModule.Stop[] = Array.from({ length: maxStops + 1 }, (_, index) => ({
    id: `place-${index}`,
    description: `Store ${index}`,
    location: { lat: 1, lng: 2 },
    storeId: index + 1,
    storeName: `Store ${index}`,
    storeAddress: `${index} Main St`,
  }));

  await assert.rejects(
    () =>
      TripPlannerModule.submitTrip(stops, vehicleSize, {
        push: () => {
          throw new Error('Navigation should not occur when stop limit is exceeded');
        },
      }),
    {
      message: `Trips with a ${vehicleSize} vehicle can include at most ${maxStops} stops.`,
    }
  );

  assert.strictEqual(postMock.mock.calls.length, 0);
  postMock.mock.restore();
});
