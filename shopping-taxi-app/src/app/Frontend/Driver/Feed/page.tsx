// Driver Feed (src/app/Frontend/Driver/Feed/page.tsx)

'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/app/services/apiClient';
import { useRouter } from 'next/navigation';

interface User { id: number; username: string; email: string; role: string; }
interface Trip { id: number; [key: string]: unknown; }

type TripListProps = {
  trips: Trip[];
  onSelect: (id: number) => void;
};

// Simple TripList component for demonstration
function TripList({ trips, onSelect }: TripListProps) {
  return (
    <ul>
      {trips.map(trip => (
        <li key={trip.id}>
          <button onClick={() => onSelect(trip.id)}>
            Trip #{trip.id}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function DriverFeed() {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        if (res.data.user.role !== 'driver') throw new Error();
        setUser(res.data.user);
      } catch {
        router.push('/Frontend/Driver/Auth/Login');
      }
    };
    fetchMe();
  }, [router]);

  useEffect(() => {
    if (user) {
      apiClient.get('/trips/driver').then(r => setTrips(r.data.trips));
    }
  }, [user]);

  if (!user) return <p>Loading…</p>;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Driver Dashboard</h1>
      <p>Welcome, {user.username}!</p>
      <h2 className="text-2xl font-bold mt-8 mb-4">Assigned Trips</h2>
      <TripList trips={trips} onSelect={(id: number) => router.push(`/Frontend/Driver/Trip/${id}`)} />
    </main>
  );
}
