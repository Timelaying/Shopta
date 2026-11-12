'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const MapViewInner = dynamic(() => import('./MapViewInner'), {
  ssr: false,
  loading: () => <p>Loading map…</p>,
});

interface Props { tripId: string; }

const DEFAULT_CENTER: [number, number] = [51.5074, -0.1278];

export default function TaxiLocationMap({ tripId }: Props) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || base.replace(/\/?api$/, '');
    const socket = io(socketUrl, { withCredentials: true });
    socket.emit('joinTrip', tripId);
    socket.on('locationUpdate', ({ lat, lng }: { lat: number; lng: number }) => {
      setPosition([lat, lng]);
    });
    return () => {
      socket.disconnect();
    };
  }, [tripId]);

  return (
    <MapViewInner
      center={position || DEFAULT_CENTER}
      zoom={15}
      markers={position ? [{ position, label: 'Taxi' }] : []}
    />
  );
}
