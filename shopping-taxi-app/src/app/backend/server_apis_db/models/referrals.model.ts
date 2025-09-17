import { PoolClient } from 'pg';
import pool from '../db';
import { generateUniqueReferralCode } from './users.model';

export interface ReferralProfile {
  referralCode: string;
  referralPoints: number;
  totalReferred: number;
  referrals: Array<{
    id: number;
    refereeName: string;
    refereeEmail: string;
    rewardPoints: number;
    status: string;
    createdAt: Date;
  }>;
}

export const getReferralProfile = async (
  userId: number,
): Promise<ReferralProfile> => {
  const userResult = await pool.query(
    'SELECT referral_code, referral_points FROM users WHERE id = $1',
    [userId],
  );

  if (!userResult.rowCount) {
    throw new Error('User not found');
  }

  const referralsResult = await pool.query(
    `SELECT r.id,
            r.reward_points,
            r.status,
            r.created_at,
            u.username AS referee_name,
            u.email AS referee_email
       FROM referrals r
  LEFT JOIN users u ON u.id = r.referee_id
      WHERE r.referrer_id = $1
   ORDER BY r.created_at DESC`,
    [userId],
  );

  return {
    referralCode: userResult.rows[0].referral_code,
    referralPoints: userResult.rows[0].referral_points,
    totalReferred: referralsResult.rowCount,
    referrals: referralsResult.rows.map((row) => ({
      id: row.id,
      refereeName: row.referee_name,
      refereeEmail: row.referee_email,
      rewardPoints: row.reward_points,
      status: row.status,
      createdAt: row.created_at,
    })),
  };
};

export const regenerateReferralCode = async (
  userId: number,
): Promise<string> => {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');
    const newCode = await generateUniqueReferralCode(client);
    await client.query('UPDATE users SET referral_code = $1 WHERE id = $2', [newCode, userId]);
    await client.query('COMMIT');
    return newCode;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getTopReferrers = async (limit = 5) => {
  const result = await pool.query(
    `SELECT id, username, referral_points
       FROM users
   ORDER BY referral_points DESC
      LIMIT $1`,
    [limit],
  );

  return result.rows;
};
