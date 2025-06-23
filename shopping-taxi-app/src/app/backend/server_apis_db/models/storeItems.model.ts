import pool from '../db';

export const linkItemToStore = async (storeId: number, itemId: number, price: number) => {
  const result = await pool.query(
    'INSERT INTO store_items (store_id, item_id, price) VALUES ($1, $2, $3) RETURNING *',
    [storeId, itemId, price]
  );
  return result.rows[0];
};

export const getStoreItems = async (storeId: number) => {
  const result = await pool.query(
    `SELECT si.*, i.name AS item_name, i.category
     FROM store_items si
     JOIN items i ON si.item_id = i.id
     WHERE si.store_id = $1`,
    [storeId]
  );
  return result.rows;
};

export const updateStoreItem = async (id: number, price: number) => {
  const result = await pool.query(
    'UPDATE store_items SET price = $1 WHERE id = $2 RETURNING *',
    [price, id]
  );
  return result.rows[0];
};

export const deleteStoreItem = async (id: number) => {
  await pool.query('DELETE FROM store_items WHERE id = $1', [id]);
};
