import pool from '../db';

export const createItem = async (name: string, category?: string) => {
  const result = await pool.query(
    'INSERT INTO items (name, category) VALUES ($1, $2) RETURNING *',
    [name, category || null]
  );
  return result.rows[0];
};

export const getAllItems = async () => {
  const result = await pool.query('SELECT * FROM items');
  return result.rows;
};

export const updateItem = async (id: number, name: string, category: string) => {
  const result = await pool.query(
    'UPDATE items SET name = $1, category = $2 WHERE id = $3 RETURNING *',
    [name, category, id]
  );
  return result.rows[0];
};

export const deleteItem = async (id: number) => {
  await pool.query('DELETE FROM items WHERE id = $1', [id]);
};
