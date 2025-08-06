import pool from '../db';

export const addRating = async (
  tripId: number,
  targetType: 'driver' | 'store',
  targetId: number,
  rating: number,
  comment?: string
) => {
  const result = await pool.query(
    `INSERT INTO ratings (trip_id, target_type, target_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [tripId, targetType, targetId, rating, comment || null]
  );
  return result.rows[0];
};

export const getDriverRatings = async (driverId: number) => {
  const result = await pool.query(
    `SELECT * FROM ratings WHERE target_type = 'driver' AND target_id = $1`,
    [driverId]
  );
  return result.rows;
};

export const getStoreRatings = async (storeId: number) => {
  const result = await pool.query(
    `SELECT * FROM ratings WHERE target_type = 'store' AND target_id = $1`,
    [storeId]
  );
  return result.rows;
};
