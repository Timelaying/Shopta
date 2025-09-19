import { Request, Response, NextFunction, RequestHandler } from 'express';
import * as TripModel from '../models/trips.model';
import { matchDriverToTrip, estimateArrival } from '../services/driver.service';
import { sendNotification } from '../services/notification.service';


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
export const createTrip = async (
  req: Request & { user: { id: number } },
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { stops, vehicleSize } = req.body; // vehicleSize from frontend
    if (!['small','standard','large'].includes(vehicleSize)) {
      res.status(400).json({ error: 'Invalid vehicle size' }); return;
    }
    if (!Array.isArray(stops) || stops.length === 0 || stops.length > 10) {
      res.status(400).json({ error: 'Stops must be 1-10' }); return;
    }
    const trip = await TripModel.createTrip(userId, vehicleSize);
    await TripModel.addTripStops(trip.id, stops);
    const driver = await matchDriverToTrip(trip.id);
    const eta = driver ? await estimateArrival(driver.id, trip.id) : null;
    res.status(201).json({ tripId: trip.id, driver, eta }); return;
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

export const getTripById: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(tripId)) { res.status(400).json({ error: 'Invalid trip id' }); return; }
    const trip = await TripModel.getTripById(tripId);
    if (!trip) { res.status(404).json({ error: 'Trip not found' }); return; }
    const stops = (trip.stops ?? []).map(stop => ({
      id: stop.id,
      trip_id: stop.trip_id,
      store_id: stop.store_id,
      visited: stop.visited,
      sequence: stop.sequence,
      name: stop.store_name ?? undefined,
      address: stop.store_address ?? undefined,
      latitude: stop.latitude ?? null,
      longitude: stop.longitude ?? null,
    }));
    res.json({
      id: trip.id,
      user_id: trip.user_id,
      vehicle_size: trip.vehicle_size,
      created_at: trip.created_at,
      stops,
    }); return;
  } catch (err) { next(err); return; }
};

// Driver: mark current stop done
export const completeStop = async (
  req: Request & { user?: { id: number } },
  res: Response,
  next: NextFunction
) => {
  try {
    const stopId = parseInt(req.params.stopId, 10);
    const stop = await TripModel.markStopVisited(stopId);
    const nextStop = await TripModel.getNextUnvisitedStop(stop.trip_id, stop.sequence);
    const userId = req.user?.id;
    if (userId) {
      await sendNotification(userId, `Stop ${stopId} completed`);
    }
    res.json({ stop, nextStop }); return;
  } catch (err) { next(err); return; }
};

export const getTripStop: RequestHandler = async (req, res, next) => {
  try {
    const stopId = Number.parseInt(req.params.stopId, 10);
    if (Number.isNaN(stopId)) { res.status(400).json({ error: 'Invalid stop id' }); return; }
    const stop = await TripModel.getTripStopById(stopId);
    if (!stop) { res.status(404).json({ error: 'Trip stop not found' }); return; }
    const latitude = stop.latitude ?? null;
    const longitude = stop.longitude ?? null;
    res.json({
      id: stop.id,
      trip_id: stop.trip_id,
      store_id: stop.store_id,
      visited: stop.visited,
      sequence: stop.sequence,
      name: stop.store_name ?? undefined,
      address: stop.store_address ?? undefined,
      coords: [latitude, longitude] as [number | null, number | null],
      latitude,
      longitude,
    }); return;
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
