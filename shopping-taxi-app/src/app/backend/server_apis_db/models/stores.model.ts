import pool from '../db';

export const createStore = async (name: string, address: string, latitude: number, longitude: number) => {
  const result = await pool.query(
    'INSERT INTO stores (name, address, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, address, latitude, longitude]
  );
  return result.rows[0];
};

export const getAllStores = async () => {
  const result = await pool.query('SELECT * FROM stores');
  return result.rows;
};

export const updateStore = async (id: number, name: string, address: string) => {
  const result = await pool.query(
    'UPDATE stores SET name = $1, address = $2 WHERE id = $3 RETURNING *',
    [name, address, id]
  );
  return result.rows[0];
};

export const deleteStore = async (id: number) => {
  await pool.query('DELETE FROM stores WHERE id = $1', [id]);
};
