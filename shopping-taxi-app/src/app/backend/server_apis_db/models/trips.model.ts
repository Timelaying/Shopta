import pool from '../db';

export interface Trip { id: number; user_id: number; created_at: string; }
export interface TripStop { id: number; trip_id: number; store_id: number; visited: boolean; sequence: number; }

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

export const markStopVisited = async (stopId: number): Promise<TripStop> => {
  const result = await pool.query(
    'UPDATE trip_stops SET visited = TRUE WHERE id = $1 RETURNING *',
    [stopId]
  );
  return result.rows[0];
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
