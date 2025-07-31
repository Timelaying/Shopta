// src/app/Frontend/Admin/Monitor/page.tsx
'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/app/services/apiClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Trip = {
  id: number;
  user_id: number;
  stops: { visited: boolean }[];
};

export default function AdminMonitor() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const router = useRouter();
  useEffect(() => {
    apiClient.get('/trips/admin', { withCredentials: true }).then(r => setTrips(r.data.trips));
  }, []);
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">All Trips</h1>
      <ul className="space-y-4">
        {trips.map(t => (
          <li key={t.id} className="border p-4 rounded">
            <h2>Trip #{t.id} (User {t.user_id})</h2>
            <p>Stops: {t.stops.length}, Completed: {t.stops.filter(s=>s.visited).length}</p>
            <Button onClick={() => router.push(`/Frontend/Admin/MapReady?trip=${t.id}`)}>View Map</Button>
          </li>
        ))}
      </ul>
    </main>
  );
}