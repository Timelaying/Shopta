import apiClient from '../../../services/apiClient';

export type Place = {
  id: string;
  description: string;
  location: { lat: number; lng: number };
};

export type Stop = Place & {
  storeId: number;
  storeName: string;
  storeAddress: string;
};

export const persistPlaceAsStore = async (place: Place): Promise<Stop> => {
  const fallbackName = place.description.split(',')[0]?.trim() || place.description;
  const response = await apiClient.post(
    '/stores',
    {
      name: fallbackName,
      address: place.description,
      latitude: place.location.lat,
      longitude: place.location.lng,
    },
    { withCredentials: true }
  );
  const store = response.data;
  if (!store || typeof store.id !== 'number') {
    throw new Error('Invalid store response');
  }
  return {
    ...place,
    storeId: store.id,
    storeName: store.name ?? fallbackName,
    storeAddress: store.address ?? place.description,
  };
};

export const buildTripPayload = (
  stops: Stop[],
  vehicleSize: 'small' | 'standard' | 'large'
) => ({
  stops: stops.map((stop, index) => ({ store_id: stop.storeId, sequence: index + 1 })),
  vehicleSize,
});

export const submitTrip = async (
  stops: Stop[],
  vehicleSize: 'small' | 'standard' | 'large',
  router: { push: (url: string) => void }
) => {
  if (!stops.length) {
    throw new Error('Add at least one stop before starting a trip.');
  }
  const invalidStop = stops.find((stop) => typeof stop.storeId !== 'number' || !Number.isFinite(stop.storeId));
  if (invalidStop) {
    throw new Error('Stops must reference saved stores.');
  }

  const payload = buildTripPayload(stops, vehicleSize);
  const res = await apiClient.post('/trips', payload, { withCredentials: true });
  const tripId = res.data?.tripId;
  if (typeof tripId !== 'number') {
    throw new Error('Trip creation response did not include a trip id.');
  }
  router.push(`/Frontend/Customer/Trips/${tripId}`);
  return res.data;
};
