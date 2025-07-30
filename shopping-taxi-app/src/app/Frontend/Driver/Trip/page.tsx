// src/app/Frontend/Driver/Feed/page.tsx
'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/app/services/apiClient';
import TripList from '@/components/TripList';
import { useRouter } from 'next/navigation';

export default function DriverFeed() {
  const [trips, setTrips] = useState([]);
  const router = useRouter();
  useEffect(() => {
    apiClient.get('/trips/driver', { withCredentials: true }).then(r => setTrips(r.data.trips));
  }, []);
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Assigned Trips</h1>
      <TripList trips={trips} onSelect={id => router.push(`/Frontend/Driver/Trip/${id}`)} />
    </main>
  );
}