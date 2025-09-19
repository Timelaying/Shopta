import pool from '../db';

export interface Trip { id: number; user_id: number; created_at: string; vehicle_size: string; }
export interface TripStop { id: number; trip_id: number; store_id: number; visited: boolean; sequence: number; }

export interface TripStopWithStore extends TripStop {
  store_name?: string | null;
  store_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export type TripWithStops = Trip & { stops: TripStopWithStore[] };

export const createTrip = async (userId: number, vehicleSize: string): Promise<Trip> => {
  const { rows } = await pool.query(
    'INSERT INTO trips (user_id, vehicle_size) VALUES ($1, $2) RETURNING *',
    [userId, vehicleSize]
  );
  return rows[0];
};

export const addTripStops = async (
  tripId: number,
  stops: { store_id: number; sequence: number }[]
): Promise<void> => {
  const queries = stops.map(s =>
    pool.query(
      'INSERT INTO trip_stops (trip_id, store_id, sequence) VALUES ($1, $2, $3)',
      [tripId, s.store_id, s.sequence]
    )
  );
  await Promise.all(queries);
};

export const getTripStops = async (tripId: number): Promise<TripStop[]> => {
  const result = await pool.query(
    'SELECT * FROM trip_stops WHERE trip_id = $1 ORDER BY sequence',
    [tripId]
  );
  return result.rows;
};

export const getTripById = async (tripId: number): Promise<TripWithStops | null> => {
  const tripResult = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
  const trip = tripResult.rows[0] as Trip | undefined;
  if (!trip) {
    return null;
  }
  const stopResult = await pool.query(
    `SELECT ts.*, s.name AS store_name, s.address AS store_address, s.latitude, s.longitude
     FROM trip_stops ts
     LEFT JOIN stores s ON ts.store_id = s.id
     WHERE ts.trip_id = $1
     ORDER BY ts.sequence`,
    [tripId]
  );
  const stops = stopResult.rows as TripStopWithStore[];
  return { ...trip, stops };
};

export const getTripStopById = async (stopId: number): Promise<TripStopWithStore | null> => {
  const result = await pool.query(
    `SELECT ts.*, s.name AS store_name, s.address AS store_address, s.latitude, s.longitude
     FROM trip_stops ts
     LEFT JOIN stores s ON ts.store_id = s.id
     WHERE ts.id = $1`,
    [stopId]
  );
  const stop = result.rows[0] as TripStopWithStore | undefined;
  return stop ?? null;
};

export const markStopVisited = async (stopId: number): Promise<TripStop> => {
  const result = await pool.query(
    'UPDATE trip_stops SET visited = TRUE WHERE id = $1 RETURNING *',
    [stopId]
  );
  return result.rows[0];
};

export const getNextUnvisitedStop = async (
  tripId: number,
  sequence: number
): Promise<TripStop | null> => {
  const result = await pool.query(
    'SELECT * FROM trip_stops WHERE trip_id = $1 AND sequence > $2 AND visited = FALSE ORDER BY sequence LIMIT 1',
    [tripId, sequence]
  );
  return result.rows[0] || null;
};

export const getTripsByUser = async (userId: number): Promise<Trip[]> => {
  const result = await pool.query('SELECT * FROM trips WHERE user_id = $1', [userId]);
  return result.rows;
};

export const getAllTrips = async (): Promise<(Trip & { stops: TripStop[] })[]> => {
  const trips = await pool.query('SELECT * FROM trips ORDER BY created_at DESC');
  const data = await Promise.all(trips.rows.map(async (t: Trip) => {
    const stops = await getTripStops(t.id);
    return { ...t, stops };
  }));
  return data;
};

export const getUserTrips = async (userId: number) => {
  const result = await pool.query(
    'SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

export const deleteTrip = async (id: number) => {
  await pool.query('DELETE FROM trips WHERE id = $1', [id]);
};
