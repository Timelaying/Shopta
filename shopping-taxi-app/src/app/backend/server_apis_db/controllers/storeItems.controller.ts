import { Request, Response } from 'express';
import * as StoreItemModel from '../models/storeItems.model';

export const linkItemToStore = async (req: Request, res: Response) => {
  const { storeId, itemId, price } = req.body;
  if (!storeId || !itemId || price === undefined) {
    return res.status(400).json({ error: 'Missing link fields' });
  }

  try {
    const link = await StoreItemModel.linkItemToStore(storeId, itemId, price);
    res.status(201).json(link);
  } catch {
    res.status(500).json({ error: 'Failed to link item to store' });
  }
};

export const getStoreItems = async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  try {
    const items = await StoreItemModel.getStoreItems(storeId);
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to fetch store items' });
  }
};
