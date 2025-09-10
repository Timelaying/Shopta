'use client';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const containerStyle = { width: '100%', height: '400px' };

interface Props { tripId: string; }

export default function TaxiLocationMap({ tripId }: Props) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const socketUrl = base.replace(/\/?api$/, '');
    const socket = io(socketUrl, { withCredentials: true });
    socket.emit('joinTrip', tripId);
    socket.on('locationUpdate', ({ lat, lng }: { lat: number; lng: number }) => {
      setPosition({ lat, lng });
    });
    return () => {
      socket.disconnect();
    };
  }, [tripId]);

  if (loadError) return <p>Map failed to load</p>;
  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={position || { lat: 0, lng: 0 }} zoom={15}>
      {position && <Marker position={position} />}
    </GoogleMap>
  );
}
