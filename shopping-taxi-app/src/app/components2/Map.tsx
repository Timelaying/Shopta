// src/components/Map.tsx
'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
interface Props { coords: [number, number][]; }
export default function Map({ coords }: Props) {
  const center: [number, number] = coords[0] || [0, 0];
  return (
    <MapContainer center={center} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {coords.map((c, i) => (
        <Marker key={i} position={c}>
          <Popup>Stop {i + 1}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}