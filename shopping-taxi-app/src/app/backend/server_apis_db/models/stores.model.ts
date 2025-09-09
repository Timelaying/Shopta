import pool from '../db';

export interface Store {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export const getAllStores = async (): Promise<Store[]> => {
  const { rows } = await pool.query('SELECT * FROM stores ORDER BY name');
  return rows;
};

export const searchStores = async (term: string): Promise<Store[]> => {
  const like = `%${term}%`;
  const { rows } = await pool.query(
    'SELECT * FROM stores WHERE name ILIKE $1 OR address ILIKE $1 ORDER BY name',
    [like]
  );
  return rows;
};

export const getStoreById = async (id: number): Promise<Store | null> => {
  const { rows } = await pool.query('SELECT * FROM stores WHERE id = $1', [id]);
  return rows[0] || null;
};

export const createStore = async (name: string, address: string, latitude: number, longitude: number) => {
  const result = await pool.query(
    'INSERT INTO stores (name, address, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, address, latitude, longitude]
  );
  return result.rows[0];
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
