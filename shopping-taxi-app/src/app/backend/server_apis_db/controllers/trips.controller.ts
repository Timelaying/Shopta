import { Request, Response } from 'express';
import * as TripModel from '../models/trips.model';

export const createTrip = async (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  try {
    const trip = await TripModel.createTrip(userId);
    res.status(201).json(trip);
  } catch {
    res.status(500).json({ error: 'Failed to create trip' });
  }
};

export const getUserTrips = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  try {
    const trips = await TripModel.getUserTrips(userId);
    res.json(trips);
  } catch {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};
