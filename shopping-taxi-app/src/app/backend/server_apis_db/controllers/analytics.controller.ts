import { RequestHandler } from 'express';
import {
  fetchTripSummary,
  submitTripAnalytics,
  TripAnalyticsPayload,
} from '../services/analytics.service';

const validatePayload = (body: any): TripAnalyticsPayload | null => {
  const {
    tripId,
    userId,
    totalDistanceKm,
    totalDurationMinutes,
    stopsVisited,
    savingsAmount,
  } = body ?? {};

  if (
    typeof tripId !== 'number' ||
    typeof userId !== 'number' ||
    typeof totalDistanceKm !== 'number' ||
    typeof totalDurationMinutes !== 'number' ||
    typeof stopsVisited !== 'number'
  ) {
    return null;
  }

  return {
    tripId,
    userId,
    totalDistanceKm,
    totalDurationMinutes,
    stopsVisited,
    savingsAmount,
  };
};

export const getTripSummary: RequestHandler = async (_req, res, next) => {
  try {
    const summary = await fetchTripSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

export const ingestTripAnalytics: RequestHandler = async (req, res, next) => {
  const payload = validatePayload(req.body);
  if (!payload) {
    res.status(400).json({ error: 'Invalid analytics payload' });
    return;
  }

  try {
    const result = await submitTripAnalytics(payload);
    res.status(202).json(result);
  } catch (error) {
    next(error);
  }
};
