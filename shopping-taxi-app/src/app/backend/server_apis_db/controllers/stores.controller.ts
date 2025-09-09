import { Request, Response, NextFunction, RequestHandler } from 'express';
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


export const listStores: RequestHandler = async (req, res, next) => {
  try {
    const { q } = req.query;
    const stores = typeof q === 'string' && q.length > 0
      ? await StoreModel.searchStores(q)
      : await StoreModel.getAllStores();
    res.json({ stores }); return;
  } catch (err) { next(err); return; }
};

export const getStore: RequestHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const store = await StoreModel.getStoreById(id);
    if (!store) { res.status(404).json({ error: 'Store not found' }); return; }
    res.json({ store }); return;
  } catch (err) { next(err); return; }
};
