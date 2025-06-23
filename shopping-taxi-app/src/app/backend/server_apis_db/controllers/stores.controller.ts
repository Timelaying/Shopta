import { Request, Response } from 'express';
import * as StoreModel from '../models/stores.model';

export const createStore = async (req: Request, res: Response) => {
  const { name, address, latitude, longitude } = req.body;
  if (!name || !address || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Missing store fields' });
  }

  try {
    const store = await StoreModel.createStore(name, address, latitude, longitude);
    res.status(201).json(store);
  } catch {
    res.status(500).json({ error: 'Failed to create store' });
  }
};

export const getAllStores = async (_req: Request, res: Response) => {
  try {
    const stores = await StoreModel.getAllStores();
    res.json(stores);
  } catch {
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
};
