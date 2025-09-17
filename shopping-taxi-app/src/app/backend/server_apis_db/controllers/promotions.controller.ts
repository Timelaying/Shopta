import { RequestHandler } from 'express';
import { AuthenticatedRequest } from '../middleware/jwtMiddleware';
import * as PromotionsModel from '../models/promotions.model';
import * as UsersModel from '../models/users.model';

const ensureAdmin = async (userId: number) => {
  const user = await UsersModel.findUserById(userId);
  return user?.role === 'admin';
};

export const listPromotions: RequestHandler = async (req, res, next) => {
  try {
    const activeOnly = req.query.active !== 'false';
    const promotions = await PromotionsModel.getPromotions(activeOnly);
    res.json({ promotions });
  } catch (error) {
    next(error);
  }
};

export const listPromotionsForStore: RequestHandler = async (req, res, next) => {
  try {
    const storeId = Number(req.params.storeId);
    if (Number.isNaN(storeId)) {
      res.status(400).json({ error: 'Invalid store id' });
      return;
    }
    const activeOnly = req.query.active !== 'false';
    const promotions = await PromotionsModel.getPromotionsForStore(storeId, activeOnly);
    res.json({ promotions });
  } catch (error) {
    next(error);
  }
};

export const createPromotion: RequestHandler = async (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const isAdmin = await ensureAdmin(Number(authReq.user.id));
    if (!isAdmin) {
      res.status(403).json({ error: 'Admin privileges required' });
      return;
    }

    const { storeId, title, description, discountPercentage, startDate, endDate, isActive } = req.body;
    const numericStoreId = Number(storeId);
    const numericDiscount = Number(discountPercentage);
    if (
      Number.isNaN(numericStoreId) ||
      !title ||
      Number.isNaN(numericDiscount) ||
      !startDate ||
      !endDate
    ) {
      res.status(400).json({ error: 'Missing or invalid required fields' });
      return;
    }

    const promotion = await PromotionsModel.createPromotion({
      storeId: numericStoreId,
      title,
      description,
      discountPercentage: numericDiscount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive ?? true,
    });

    res.status(201).json({ promotion });
  } catch (error) {
    next(error);
  }
};

export const updatePromotion: RequestHandler = async (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const isAdmin = await ensureAdmin(Number(authReq.user.id));
    if (!isAdmin) {
      res.status(403).json({ error: 'Admin privileges required' });
      return;
    }

    const promotionId = Number(req.params.id);
    if (Number.isNaN(promotionId)) {
      res.status(400).json({ error: 'Invalid promotion id' });
      return;
    }

    const updates: any = { ...req.body };
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);
    if (updates.discountPercentage !== undefined) {
      updates.discountPercentage = Number(updates.discountPercentage);
    }

    const promotion = await PromotionsModel.updatePromotion(promotionId, updates);
    if (!promotion) {
      res.status(404).json({ error: 'Promotion not found' });
      return;
    }

    res.json({ promotion });
  } catch (error) {
    next(error);
  }
};

export const archivePromotion: RequestHandler = async (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const isAdmin = await ensureAdmin(Number(authReq.user.id));
    if (!isAdmin) {
      res.status(403).json({ error: 'Admin privileges required' });
      return;
    }

    const promotionId = Number(req.params.id);
    if (Number.isNaN(promotionId)) {
      res.status(400).json({ error: 'Invalid promotion id' });
      return;
    }

    await PromotionsModel.archivePromotion(promotionId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
