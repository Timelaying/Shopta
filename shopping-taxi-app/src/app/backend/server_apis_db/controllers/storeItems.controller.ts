// storeItems.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as StoreItemModel from '../models/storeItems.model';

export const linkItemToStore = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { storeId, itemId, price } = req.body;
  if (!storeId || !itemId || price === undefined) {
    res.status(400).json({ error: 'Missing link fields' });
    return;
  }

  try {
    const link = await StoreItemModel.linkItemToStore(storeId, itemId, price);
    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
};

export const getStoreItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const storeId = parseInt(req.params.storeId, 10);
  try {
    const items = await StoreItemModel.getStoreItems(storeId);
    res.json(items);
  } catch (err) {
    next(err);
  }
};
