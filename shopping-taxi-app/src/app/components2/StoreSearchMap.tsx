'use client';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useCallback, useState } from 'react';
import { AxiosError } from 'axios';
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
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});

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
            setSaveStatus((prev) => {
              const updatedStatuses: Record<string, 'idle' | 'saving' | 'saved' | 'error'> = {};

              newMarkers.forEach((marker) => {
                updatedStatuses[marker.id] = prev[marker.id] || 'idle';
              });

              return updatedStatuses;
            });
          }
        );
      });
    }
  }, []);

  const handleSaveStore = useCallback(async (marker: MarkerInfo) => {
    const currentStatus = saveStatus[marker.id];
    if (currentStatus === 'saving' || currentStatus === 'saved') {
      return;
    }

    setSaveStatus((prev) => ({ ...prev, [marker.id]: 'saving' }));

    try {
      await apiClient.post('/stores', {
        name: marker.name,
        address: marker.name,
        latitude: marker.position.lat,
        longitude: marker.position.lng,
      });
      setSaveStatus((prev) => ({ ...prev, [marker.id]: 'saved' }));
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 409) {
        setSaveStatus((prev) => ({ ...prev, [marker.id]: 'saved' }));
        return;
      }

      setSaveStatus((prev) => ({ ...prev, [marker.id]: 'error' }));
    }
  }, [saveStatus]);

  if (loadError) return <p>Map failed to load</p>;
  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <div className="space-y-4">
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

      {markers.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Nearby stores</h2>
          {markers.map((marker) => {
            const status = saveStatus[marker.id] || 'idle';
            const isSaving = status === 'saving';
            const isSaved = status === 'saved';
            const isError = status === 'error';

            return (
              <div
                key={marker.id}
                className="flex items-center justify-between rounded border border-gray-200 p-3"
              >
                <span>{marker.name}</span>
                <div className="flex items-center gap-2">
                  {isError && <span className="text-sm text-red-600">Failed to save</span>}
                  {isSaved && !isError && (
                    <span className="text-sm text-green-600">Saved</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSaveStore(marker)}
                    disabled={isSaving || isSaved}
                    className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {isSaving ? 'Saving…' : isSaved ? 'Saved' : 'Save store'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

