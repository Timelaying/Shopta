import { Request, Response, NextFunction } from 'express';
import * as StoreModel from '../models/stores.model';

export const createStore = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name, address, latitude, longitude } = req.body;
  if (!name || !address || latitude === undefined || longitude === undefined) {
    res.status(400).json({ error: 'Missing store fields' });
    return;
  }

  try {
    const store = await StoreModel.createStore(name, address, latitude, longitude);
    res.status(201).json(store);
  } catch (err) {
    next(err);
  }
};

export const getAllStores = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stores = await StoreModel.getAllStores();
    res.json(stores);
  } catch (err) {
    next(err);
  }
};
