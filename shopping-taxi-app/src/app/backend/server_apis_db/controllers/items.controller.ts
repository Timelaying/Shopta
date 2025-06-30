// item.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as ItemModel from '../models/items.model';

export const createItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name, category } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  try {
    const item = await ItemModel.createItem(name, category);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

export const getAllItems = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const items = await ItemModel.getAllItems();
    res.json(items);
  } catch (err) {
    next(err);
  }
};
