import { Request, Response, NextFunction } from 'express';
import * as TripModel from '../models/trips.model';

export const createTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  try {
    const trip = await TripModel.createTrip(userId);
    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
};

export const getUserTrips = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = parseInt(req.params.userId, 10);
  try {
    const trips = await TripModel.getUserTrips(userId);
    res.json(trips);
  } catch (err) {
    next(err);
  }
};
