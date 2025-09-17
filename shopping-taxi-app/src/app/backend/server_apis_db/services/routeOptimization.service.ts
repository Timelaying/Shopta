import axios from 'axios';
import config from '../config/config';

const client = axios.create({
  baseURL: config.pythonOptimizerUrl,
  timeout: 10000,
});

export interface StoreStopPayload {
  identifier: string;
  lat: number;
  lng: number;
  store_type: string;
  service_time: number;
  priority: number;
  traffic_multiplier?: number;
}

export interface RouteSuggestionPayload {
  start_lat: number;
  start_lng: number;
  stores: StoreStopPayload[];
  google_api_key?: string;
  iterations?: number;
  random_seed?: number;
}

export const requestOptimizedRoute = async (payload: RouteSuggestionPayload) => {
  const response = await client.post('/optimize-route', payload);
  return response.data;
};

export const requestAISuggestion = async (payload: RouteSuggestionPayload) => {
  const response = await client.post('/ai-suggest-route', payload);
  return response.data;
};
