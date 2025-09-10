'use client';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useCallback, useState } from 'react';
import apiClient from '@/app/services/apiClient';

const containerStyle = { width: '100%', height: '400px' };
const libraries: ('places')[] = ['places'];

interface MarkerInfo {
  id: string;
  position: google.maps.LatLngLiteral;
  name: string;
}

export default function StoreSearchMap() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 0,
    lng: 0,
  });
  const [markers, setMarkers] = useState<MarkerInfo[]>([]);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const userLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCenter(userLoc);

        const service = new google.maps.places.PlacesService(map);
        service.nearbySearch(
          {
            location: userLoc,
            radius: 5000,
            type: 'store',
          },
          (results) => {
            const newMarkers = (results || [])
              .filter((r): r is google.maps.places.PlaceResult & { geometry: google.maps.places.PlaceGeometry } => !!r && !!r.geometry && !!r.geometry.location)
              .map((r) => ({
                id: r.place_id || Math.random().toString(),
                position: {
                  lat: r.geometry!.location!.lat(),
                  lng: r.geometry!.location!.lng(),
                },
                name: r.name || 'Store',
              }));
            setMarkers(newMarkers);
            newMarkers.forEach(m => {
              apiClient.post('/stores', {
                name: m.name,
                address: m.name,
                latitude: m.position.lat,
                longitude: m.position.lng
              }).catch(() => {});
            });
          }
        );
      });
    }
  }, []);

  if (loadError) return <p>Map failed to load</p>;
  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onLoad={handleMapLoad}
    >
      {markers.map((m) => (
        <Marker key={m.id} position={m.position} title={m.name} />
      ))}
    </GoogleMap>
  );
}

