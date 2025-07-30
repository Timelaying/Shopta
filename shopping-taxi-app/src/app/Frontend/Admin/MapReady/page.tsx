// src/app/Frontend/Admin/MapReady/page.tsx
'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import apiClient from '@/app/services/apiClient';
import Map from '@/components/Map';

export default function AdminMapReady() {
  const params = useSearchParams();
  const tripId = params.get('trip');
  const [coords, setCoords] = useState<[number,number][]>([]);
  useEffect(() => {
    apiClient.get(`/trips/${tripId}`, { withCredentials: true }).then(r => {
      const c = r.data.stops.map((s:any)=>([s.lat,s.lng]));
      setCoords(c);
    });
  }, [tripId]);
  return (
    <main className="p-8">
      <h1>Live Map: Trip {tripId}</h1>
      <Map coords={coords} />
    </main>
  );
}