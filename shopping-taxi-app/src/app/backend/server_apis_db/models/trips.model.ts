import pool from '../db';

export const createTrip = async (userId: number) => {
  const result = await pool.query(
    'INSERT INTO trips (user_id) VALUES ($1) RETURNING *',
    [userId]
  );
  return result.rows[0];
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
