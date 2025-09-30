// src/app/Frontend/Driver/Trip/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
// Removed unused Socket import
import { useParams } from 'next/navigation';
import apiClient from '@/app/services/apiClient';
import GoogleMap from '@/app/components2/GoogleMap';
import { SOCKET_URL } from '@/app/services/socketConfig';

export default function DriverTrip() {
  const { id } = useParams();
  const [position, setPosition] = useState<{lat:number,lng:number} | null>(null);
  const [stops, setStops] = useState<{ latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    // Fetch stops with coords
    apiClient.get(`/trips/${id}`, { withCredentials: true }).then(r=>setStops(r.data.stops));

    // Setup socket
    // Setup socket
    const s = io(SOCKET_URL, { path: '/socket.io' });
    s.emit('joinTrip', id);
    // Watch geolocation
    const watcher = navigator.geolocation.watchPosition(pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      setPosition({ lat, lng });
      s.emit('sendLocation', { tripId: id, lat, lng });
    });

    return () => { navigator.geolocation.clearWatch(watcher); s.disconnect(); };
  }, [id]);

  return (
    <main className="p-8">
      <h1>Driver Trip #{id}</h1>
      <GoogleMap coords={stops.map(s=>[s.latitude, s.longitude])} />
      {position && <p>My position: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</p>}
    </main>
  );
}
