// src/models/token.model.ts
import pool from '../db';

export const saveToken = async (userId: number, token: string): Promise<void> => {
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)',
    [userId, token]
  );
};

export const isTokenValid = async (userId: number, token: string): Promise<boolean> => {
  const result = await pool.query(
    'SELECT 1 FROM refresh_tokens WHERE user_id = $1 AND token = $2',
    [userId, token]
  );
  // coalesce null to 0, then compare
  return (result.rowCount ?? 0) > 0;
};

export const replaceToken = async (
  userId: number,
  oldToken: string,
  newToken: string
): Promise<void> => {
  await pool.query(
    'UPDATE refresh_tokens SET token = $1 WHERE user_id = $2 AND token = $3',
    [newToken, userId, oldToken]
  );
};

export const deleteToken = async (token: string): Promise<void> => {
  await pool.query(
    'DELETE FROM refresh_tokens WHERE token = $1',
    [token]
  );
};
