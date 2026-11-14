'use client';
import dynamic from 'next/dynamic';
import type { MapMarker } from './MapViewInner';

const MapViewInner = dynamic(() => import('./MapViewInner'), {
  ssr: false,
  loading: () => <p>Loading map…</p>,
});

interface Props {
  coords: [number, number][];
}

/** Shows a set of coordinates on an OpenStreetMap map (no API key needed). */
export default function MapView({ coords }: Props) {
  const markers: MapMarker[] = coords.map((c, i) => ({ position: c, label: `Stop ${i + 1}` }));
  return <MapViewInner center={coords[0] || [51.5074, -0.1278]} markers={markers} />;
}
