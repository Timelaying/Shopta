import axios from 'axios';
import config from '../config/config';

const client = axios.create({
  baseURL: config.analyticsServiceUrl,
  timeout: 8000,
});

export interface TripAnalyticsPayload {
  tripId: number;
  userId: number;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  stopsVisited: number;
  savingsAmount?: number;
}

export const fetchTripSummary = async () => {
  const response = await client.get('/analytics/summary');
  return response.data;
};

export const submitTripAnalytics = async (payload: TripAnalyticsPayload) => {
  const response = await client.post('/analytics/ingest', payload);
  return response.data;
};
