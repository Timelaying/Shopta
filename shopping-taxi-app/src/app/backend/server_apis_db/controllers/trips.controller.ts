import { Request, Response, NextFunction, RequestHandler } from 'express';
import * as TripModel from '../models/trips.model';


// Extend Express Request interface to include 'user'
import 'express';

declare module 'express' {
  interface User {
    id: number;
    // add other user properties if needed
  }
  interface Request {
    user?: User;
  }
}

// Customer: create trip with stops
export const createTrip = async (req: Request & { user: { id: number } }, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { stops } = req.body;
    // validation same as before
    const trip = await TripModel.createTrip(userId);
    await TripModel.addTripStops(trip.id, stops);
    res.status(201).json({ tripId: trip.id }); return;
  } catch (err) { next(err); return; }
};

// Customer: view own trips
export const getMyTrips = async (req: Request & { user: { id: number } }, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const trips = await TripModel.getTripsByUser(userId);
    res.json({ trips }); return;
  } catch (err) { next(err); return; }
};

// Driver: view assigned trips (for MVP, assume all trips)
export const getDriverTrips: RequestHandler = async (req, res, next) => {
  try {
    const trips = await TripModel.getAllTrips();
    res.json({ trips }); return;
  } catch (err) { next(err); return; }
};

// Driver: mark current stop done
export const completeStop: RequestHandler = async (req, res, next) => {
  try {
    const stopId = parseInt(req.params.stopId, 10);
    const stop = await TripModel.markStopVisited(stopId);
    res.json({ stop }); return;
  } catch (err) { next(err); return; }
};

// Admin: monitor all trips
export const adminGetTrips: RequestHandler = async (req, res, next) => {
  try {
    const trips = await TripModel.getAllTrips();
    res.json({ trips }); return;
  } catch (err) { next(err); return; }
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
