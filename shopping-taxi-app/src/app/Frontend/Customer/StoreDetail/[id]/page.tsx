// src/app/Frontend/Customer/StoreDetail/[id]/page.tsx
'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import apiClient from '@/app/services/apiClient';
import Map from '@/app/components2/Map';
import { Button } from '@/components/ui/button';

export default function StoreDetail() {
  const { id } = useParams();
  const router = useRouter();
  type Stop = {
    id: string | number;
    name: string;
    coords: [number, number];
    // add other properties if needed
  };
  const [stop, setStop] = useState<Stop | null>(null);
  useEffect(() => {
    const fetch = async () => {
      const res = await apiClient.get(`/trips/stops/${id}`, { withCredentials: true });
      setStop(res.data);
    };
    fetch();
  }, [id]);

  if (!stop) return <p>Loading…</p>;
  return (
    <main className="p-8">
      <h1>{stop.name}</h1>
      <Map coords={[stop.coords]} />
      <Button onClick={async () => {
        await apiClient.patch(`/trips/stops/${stop.id}/done`, {}, { withCredentials: true });
        router.back();
      }}>Done @ Store</Button>
    </main>
  );
}