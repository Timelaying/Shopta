// src/app/Frontend/Customer/StoreDetail/[id]/page.tsx
'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import apiClient from '@/app/services/apiClient';
import Map from '@/app/components2/Map';
import GoogleMap from '@/app/components2/GoogleMap';
import { Button } from '@/components/ui/button';

type Stop = {
  id: string | number;
  name: string;
  coords: [number, number];
  // add other properties if needed
};

type Store = {
  id: string | number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  // add other properties if needed
};

export default function StoreDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [stop, setStop] = useState<Stop | null>(null);
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    // Fetch stop details
    apiClient.get(`/trips/stops/${id}`, { withCredentials: true })
      .then(res => setStop(res.data))
      .catch(() => setStop(null));
    // Fetch store details
    apiClient.get(`/stores/${id}`, { withCredentials: true })
      .then(r => setStore(r.data.store))
      .catch(() => setStore(null));
  }, [id]);

  if (!stop && !store) return <p>Loading…</p>;

  return (
    <main className="p-8">
      <h1>{stop?.name || store?.name}</h1>
      {store && <p>{store.address}</p>}
      {stop && <Map coords={[stop.coords]} />}
      {store && <GoogleMap coords={[[store.latitude, store.longitude]]} />}
      {stop && (
        <Button onClick={async () => {
          await apiClient.patch(`/trips/stops/${stop.id}/done`, {}, { withCredentials: true });
          router.back();
        }}>
          Done @ Store
        </Button>
      )}
    </main>
  );
}