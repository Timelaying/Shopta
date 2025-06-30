import { Request, Response, NextFunction } from 'express';
import * as TripItemModel from '../models/tripItems.model';

export const addItemToTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { tripId, itemId, quantity } = req.body;
  if (!tripId || !itemId) {
    res.status(400).json({ error: 'Trip ID and Item ID are required' });
    return;
  }
  if (quantity === undefined) {
    res.status(400).json({ error: 'Quantity is required' });
    return;
  }

  try {
    const item = await TripItemModel.addItemToTrip(tripId, itemId, quantity);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

export const getTripItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const tripId = parseInt(req.params.tripId, 10);
  try {
    const items = await TripItemModel.getTripItems(tripId);
    res.json(items);
  } catch (err) {
    next(err);
  }
};
