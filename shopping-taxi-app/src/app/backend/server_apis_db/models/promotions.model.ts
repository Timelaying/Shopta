import pool from '../db';

export interface PromotionInput {
  storeId: number;
  title: string;
  description?: string;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
}

export interface PromotionRecord {
  id: number;
  storeId: number;
  title: string;
  description: string | null;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}

const mapPromotion = (row: any): PromotionRecord => ({
  id: row.id,
  storeId: row.store_id,
  title: row.title,
  description: row.description,
  discountPercentage: Number(row.discount_percentage),
  startDate: row.start_date,
  endDate: row.end_date,
  isActive: row.is_active,
  createdAt: row.created_at,
});

export const createPromotion = async (
  input: PromotionInput,
): Promise<PromotionRecord> => {
  const result = await pool.query(
    `INSERT INTO promotions (store_id, title, description, discount_percentage, start_date, end_date, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING id, store_id, title, description, discount_percentage, start_date, end_date, is_active, created_at`,
    [
      input.storeId,
      input.title,
      input.description ?? null,
      input.discountPercentage,
      input.startDate,
      input.endDate,
      input.isActive ?? true,
    ],
  );

  return mapPromotion(result.rows[0]);
};

export const getPromotions = async (onlyActive = false) => {
  const result = await pool.query(
    `SELECT id, store_id, title, description, discount_percentage, start_date, end_date, is_active, created_at
       FROM promotions
      ${onlyActive ? 'WHERE is_active = true AND end_date >= NOW()' : ''}
   ORDER BY start_date ASC`,
  );
  return result.rows.map(mapPromotion);
};

export const getPromotionsForStore = async (
  storeId: number,
  onlyActive = true,
) => {
  const result = await pool.query(
    `SELECT id, store_id, title, description, discount_percentage, start_date, end_date, is_active, created_at
       FROM promotions
      WHERE store_id = $1
        ${onlyActive ? 'AND is_active = true AND end_date >= NOW()' : ''}
   ORDER BY start_date ASC`,
    [storeId],
  );
  return result.rows.map(mapPromotion);
};

export const updatePromotion = async (
  promotionId: number,
  updates: Partial<PromotionInput>,
) => {
  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${index++}`);
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${index++}`);
    values.push(updates.description);
  }
  if (updates.discountPercentage !== undefined) {
    fields.push(`discount_percentage = $${index++}`);
    values.push(updates.discountPercentage);
  }
  if (updates.startDate !== undefined) {
    fields.push(`start_date = $${index++}`);
    values.push(updates.startDate);
  }
  if (updates.endDate !== undefined) {
    fields.push(`end_date = $${index++}`);
    values.push(updates.endDate);
  }
  if (updates.isActive !== undefined) {
    fields.push(`is_active = $${index++}`);
    values.push(updates.isActive);
  }

  if (!fields.length) {
    const existing = await pool.query(
      'SELECT id, store_id, title, description, discount_percentage, start_date, end_date, is_active, created_at FROM promotions WHERE id = $1',
      [promotionId],
    );
    return existing.rowCount ? mapPromotion(existing.rows[0]) : null;
  }

  values.push(promotionId);
  const query = `UPDATE promotions SET ${fields.join(', ')} WHERE id = $${index} RETURNING id, store_id, title, description, discount_percentage, start_date, end_date, is_active, created_at`;
  const result = await pool.query(query, values);
  return result.rowCount ? mapPromotion(result.rows[0]) : null;
};

export const archivePromotion = async (promotionId: number) => {
  await pool.query('UPDATE promotions SET is_active = false WHERE id = $1', [promotionId]);
};
