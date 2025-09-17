import { RequestHandler } from 'express';
import {
  requestAISuggestion,
  requestOptimizedRoute,
  RouteSuggestionPayload,
} from '../services/routeOptimization.service';

const parsePayload = (body: any): RouteSuggestionPayload => {
  const { start_lat, start_lng, stores, google_api_key, iterations, random_seed } = body ?? {};
  if (
    typeof start_lat !== 'number' ||
    typeof start_lng !== 'number' ||
    !Array.isArray(stores) ||
    !stores.length
  ) {
    throw new Error('Invalid payload provided for route suggestion');
  }

  return {
    start_lat,
    start_lng,
    stores,
    google_api_key,
    iterations,
    random_seed,
  };
};

export const getOptimizedRoute: RequestHandler = async (req, res, next) => {
  try {
    const payload = parsePayload(req.body);
    const suggestion = await requestOptimizedRoute(payload);
    res.json(suggestion);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid payload')) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const getAISuggestedRoute: RequestHandler = async (req, res, next) => {
  try {
    const payload = parsePayload(req.body);
    const suggestion = await requestAISuggestion(payload);
    res.json(suggestion);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid payload')) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};
