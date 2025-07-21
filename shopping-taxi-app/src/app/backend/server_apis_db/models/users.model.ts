// src/models/users.model.ts
import pool from '../db';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const createUser = async (
  username: string,
  email: string,
  password: string,
  role: string = 'customer'
) => {
  // 1. Hash & salt the password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
    [username, email, hashedPassword, role]
  );

  // We return only the safe fields (no password)
  return result.rows[0];
};

export const findUserByEmail = async (email: string) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export const findUserById = async (id: number) => {
  const result = await pool.query('SELECT id, username, email, role, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const updateUser = async (id: number, username: string, email: string) => {
  const result = await pool.query(
    'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *',
    [username, email, id]
  );
  return result.rows[0];
};

export const deleteUser = async (id: number) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};
