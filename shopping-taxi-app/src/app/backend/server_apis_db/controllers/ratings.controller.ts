import { Request, Response, NextFunction } from 'express';
import * as RatingsModel from '../models/ratings.model';

export const rateDriver = async (
  req: Request & { user: { id: number } },
  res: Response,
  next: NextFunction
) => {
  try {
    const driverId = parseInt(req.params.driverId, 10);
    const { tripId, rating, comment } = req.body;
    const record = await RatingsModel.addRating(tripId, 'driver', driverId, rating, comment);
    res.status(201).json({ rating: record }); return;
  } catch (err) { next(err); return; }
};

export const rateStore = async (
  req: Request & { user: { id: number } },
  res: Response,
  next: NextFunction
) => {
  try {
    const storeId = parseInt(req.params.storeId, 10);
    const { tripId, rating, comment } = req.body;
    const record = await RatingsModel.addRating(tripId, 'store', storeId, rating, comment);
    res.status(201).json({ rating: record }); return;
  } catch (err) { next(err); return; }
};
