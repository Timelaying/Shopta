'use client';
import { FC } from 'react';
import {
  GoogleMap as GMap,
  Marker,
  useLoadScript,
} from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '400px' };

interface Props { coords: [number, number][]; }

const GoogleMap: FC<Props> = ({ coords }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  if (loadError) return <p>Map failed to load</p>;
  if (!isLoaded) return <p>Loading map…</p>;

  const center = coords[0] || [0, 0];

  return (
    <GMap
      mapContainerStyle={containerStyle}
      center={{ lat: center[0], lng: center[1] }}
      zoom={14}
    >
      {coords.map(([lat, lng], i) => (
        <Marker key={i} position={{ lat, lng }} />
      ))}
    </GMap>
  );
};

export default GoogleMap;