// src/app/Frontend/Customer/StoreDetail/[id]/page.tsx
'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import apiClient from '@/app/services/apiClient';
import Map from '@app/copm'

export default function StoreDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [stop, setStop] = useState(null as any);
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
      <Map coords={stop.coords} />
      <Button onClick={async () => {
        await apiClient.patch(`/trips/stops/${stop.id}/done`, {}, { withCredentials: true });
        router.back();
      }}>Done @ Store</Button>
    </main>
  );
}