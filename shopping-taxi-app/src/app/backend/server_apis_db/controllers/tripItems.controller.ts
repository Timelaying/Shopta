import { Request, Response } from 'express';
import * as TripItemModel from '../models/tripItems.model';

export const addItemToTrip = async (req: Request, res: Response) => {
  const { tripId, itemId, quantity } = req.body;
  if (!tripId || !itemId) return res.status(400).json({ error: 'Trip ID and Item ID are required' });
  if (quantity === undefined) return res.status(400).json({ error: 'Quantity is required' });

  try {
    const item = await TripItemModel.addItemToTrip(tripId, itemId, quantity);
    res.status(201).json(item);
  } catch {
    res.status(500).json({ error: 'Failed to add item to trip' });
  }
};

export const getTripItems = async (req: Request, res: Response) => {
  const tripId = parseInt(req.params.tripId);
  try {
    const items = await TripItemModel.getTripItems(tripId);
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to fetch trip items' });
  }
};
