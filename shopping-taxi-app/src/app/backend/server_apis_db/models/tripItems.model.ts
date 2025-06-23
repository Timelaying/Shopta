import pool from '../db';

export const addItemToTrip = async (tripId: number, itemId: number, quantity: number = 1) => {
  const result = await pool.query(
    'INSERT INTO trip_items (trip_id, item_id, quantity) VALUES ($1, $2, $3) RETURNING *',
    [tripId, itemId, quantity]
  );
  return result.rows[0];
};

export const getTripItems = async (tripId: number) => {
  const result = await pool.query(
    `SELECT ti.*, i.name AS item_name, i.category
     FROM trip_items ti
     JOIN items i ON ti.item_id = i.id
     WHERE ti.trip_id = $1`,
    [tripId]
  );
  return result.rows;
};

export const updateTripItem = async (id: number, quantity: number) => {
  const result = await pool.query(
    'UPDATE trip_items SET quantity = $1 WHERE id = $2 RETURNING *',
    [quantity, id]
  );
  return result.rows[0];
};

export const deleteTripItem = async (id: number) => {
  await pool.query('DELETE FROM trip_items WHERE id = $1', [id]);
};
