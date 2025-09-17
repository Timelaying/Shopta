// src/models/users.model.ts
import pool from '../db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PoolClient } from 'pg';

const REFERRAL_REWARD_POINTS = 100;
const REFEREE_BONUS_POINTS = 25;

const SALT_ROUNDS = 10;

const generateReferralCandidate = () =>
  crypto.randomBytes(4).toString('hex').toUpperCase();

export const generateUniqueReferralCode = async (
  client: PoolClient,
): Promise<string> => {
  let code = generateReferralCandidate();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await client.query(
      'SELECT 1 FROM users WHERE referral_code = $1',
      [code],
    );
    if (!existing.rowCount) {
      return code;
    }
    code = generateReferralCandidate();
  }
};

export const createUser = async (
  username: string,
  email: string,
  password: string,
  role: string = 'customer',
  referralCode?: string,
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    let referredBy: number | null = null;

    if (referralCode) {
      const referrer = await client.query(
        'SELECT id FROM users WHERE referral_code = $1',
        [referralCode],
      );
      if (referrer.rowCount) {
        referredBy = referrer.rows[0].id;
      }
    }

    const generatedCode = await generateUniqueReferralCode(client);
    const insertResult = await client.query(
      'INSERT INTO users (username, email, password, role, referral_code, referred_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, role, referral_code, referral_points, referred_by, created_at',
      [username, email, hashedPassword, role, generatedCode, referredBy],
    );

    const user = insertResult.rows[0];

    if (referredBy) {
      await client.query(
        'INSERT INTO referrals (referrer_id, referee_id, referral_code, reward_points, status) VALUES ($1, $2, $3, $4, $5)',
        [referredBy, user.id, referralCode, REFERRAL_REWARD_POINTS, 'completed'],
      );

      await client.query(
        'UPDATE users SET referral_points = referral_points + $1 WHERE id = $2',
        [REFERRAL_REWARD_POINTS, referredBy],
      );

      await client.query(
        'UPDATE users SET referral_points = referral_points + $1 WHERE id = $2',
        [REFEREE_BONUS_POINTS, user.id],
      );
    }

    await client.query('COMMIT');
    return user;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const findUserByEmail = async (email: string) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export const findUserByReferralCode = async (code: string) => {
  const result = await pool.query(
    'SELECT id, username, email, role, referral_code, referral_points FROM users WHERE referral_code = $1',
    [code],
  );
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

export const updatePassword = async (id: number, newHash: string) => {
  await pool.query(`UPDATE users SET password = $1 WHERE id = $2`, [newHash, id]);
};


export const deleteUser = async (id: number) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};
