// src/app/Frontend/Admin/MapReady/page.tsx (subscribe to socket)
'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import GoogleMap from '@/app/components2/GoogleMap';
import { SOCKET_URL } from '@/app/services/socketConfig';

export default function AdminMapLive() {
  const params = useSearchParams();
  const tripId = params.get('trip');
  const [coords, setCoords] = useState<[number,number][]>([]);

  useEffect(() => {
    const s = io(SOCKET_URL, { path: '/socket.io' });
    s.emit('joinTrip', tripId);
    s.on('locationUpdate', ({ lat, lng }: { lat: number; lng: number }) => {
      setCoords(prev => [...prev, [lat, lng]]);
    });
    return () => { s.disconnect(); };
  }, [tripId]);

  return (
    <main className="p-8">
      <h1>Live Taxi Location for Trip {tripId}</h1>
      <GoogleMap coords={coords} />
    </main>
  );
}
