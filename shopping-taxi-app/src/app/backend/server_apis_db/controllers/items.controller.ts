import { Request, Response } from 'express';
import * as ItemModel from '../models/items.model';

export const createItem = async (req: Request, res: Response) => {
  const { name, category } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const item = await ItemModel.createItem(name, category);
    res.status(201).json(item);
  } catch {
    res.status(500).json({ error: 'Failed to create item' });
  }
};

export const getAllItems = async (_req: Request, res: Response) => {
  try {
    const items = await ItemModel.getAllItems();
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};
