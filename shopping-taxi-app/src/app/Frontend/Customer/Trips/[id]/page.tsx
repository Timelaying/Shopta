'use client';
import { useEffect, useMemo, useState } from 'react';
import apiClient from '../../../../services/apiClient';

interface TripStop {
  id: number;
  store_id: number;
  sequence: number;
  visited: boolean;
}

interface TripDetail {
  id: number;
  vehicle_size?: string;
  created_at?: string;
  stops?: TripStop[];
}

interface StoreSummary {
  name: string;
  address: string;
}

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const tripId = Number(params.id);
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [stores, setStores] = useState<Record<number, StoreSummary>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sortedStops = useMemo(() => {
    return (trip?.stops ?? []).slice().sort((a, b) => a.sequence - b.sequence);
  }, [trip?.stops]);

  useEffect(() => {
    let active = true;
    const loadTrip = async () => {
      if (!Number.isFinite(tripId)) {
        setError('Invalid trip id.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [tripRes, storeRes] = await Promise.all([
          apiClient.get('/trips/driver', { withCredentials: true }),
          apiClient.get('/stores', { withCredentials: true }),
        ]);
        if (!active) return;
        const trips: TripDetail[] = tripRes.data?.trips ?? [];
        const found = trips.find((t) => t.id === tripId) ?? null;
        if (!found) {
          setTrip(null);
          setError('Trip not found.');
          return;
        }
        const storeIndex: Record<number, StoreSummary> = {};
        const storeList = storeRes.data?.stores ?? [];
        for (const store of storeList) {
          if (store && typeof store.id === 'number') {
            storeIndex[store.id] = {
              name: store.name ?? `Store ${store.id}`,
              address: store.address ?? '',
            };
          }
        }
        setStores(storeIndex);
        setTrip(found);
      } catch (err) {
        console.error('Failed to load trip details', err);
        if (active) {
          setTrip(null);
          setError('Failed to load trip details.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadTrip();
    return () => {
      active = false;
    };
  }, [tripId]);

  return (
    <main className="p-8 space-y-4">
      <h1>Trip #{Number.isFinite(tripId) ? tripId : 'Unknown'}</h1>
      {loading && <p>Loading trip details…</p>}
      {error && !loading && <p className="text-red-600">{error}</p>}
      {!loading && !error && trip && (
        <>
          {trip.vehicle_size && <p>Vehicle size: {trip.vehicle_size}</p>}
          <section className="space-y-2">
            <h2>Stops</h2>
            {sortedStops.length ? (
              <ol className="list-decimal list-inside space-y-3">
                {sortedStops.map((stop) => {
                  const store = stores[stop.store_id];
                  return (
                    <li key={stop.id}>
                      <div className="font-semibold">{store?.name ?? `Store ${stop.store_id}`}</div>
                      {store?.address && <div className="text-sm text-gray-600">{store.address}</div>}
                      <div className="text-sm">Status: {stop.visited ? 'Visited' : 'Pending'}</div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p>No stops recorded for this trip yet.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
