import pool from '../db';

export const matchDriverToTrip = async (tripId: number) => {
  const result = await pool.query(
    `SELECT id, username FROM users WHERE role = 'driver' LIMIT 1`
  );
  return result.rows[0] || null;
};

export const estimateArrival = async (_driverId: number, _tripId: number) => {
  // Placeholder ETA calculation
  return 5;
};
