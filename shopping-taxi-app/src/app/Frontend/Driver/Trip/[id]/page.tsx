// src/app/Frontend/Driver/Trip/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/app/services/apiClient';
import { useRouter, useParams } from 'next/navigation';
import Map from '@/app/components2/Map';
import { Button } from '@/components/ui/button';

export default function DriverTrip() {
  const { id } = useParams();
  const router = useRouter();
  type Stop = {
    id: number;
    store_id: string;
    lat: number;
    lng: number;
    visited: boolean;
  };

  type Trip = {
    id: number;
    stops: Stop[];
  };

  const [trip, setTrip] = useState<Trip | null>(null);
  useEffect(() => {
    apiClient.get(`/trips/${id}`, { withCredentials: true }).then(r => setTrip(r.data));
  }, [id]);

  if (!trip) return <p>Loading…</p>;
  const nextStop = trip.stops.find(s => !s.visited);
  return (
    <main className="p-8">
      <h1>Trip #{trip.id}</h1>
      <p>Next: {nextStop ? nextStop.store_id : 'Completed'}</p>
      {nextStop && (
        <Button onClick={async () => {
          await apiClient.patch(`/trips/stops/${nextStop.id}/done`, {}, { withCredentials: true });
          router.refresh();
        }}>Done @ Store</Button>
      )}
      <Map coords={trip.stops.map((s) => ([s.lat, s.lng]))} />
    </main>
  );
}