'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import apiClient from '@/app/services/apiClient';

const MapViewInner = dynamic(() => import('./MapViewInner'), {
  ssr: false,
  loading: () => <p>Loading map…</p>,
});

const DEFAULT_CENTER: [number, number] = [51.5074, -0.1278]; // London

interface MarkerInfo {
  id: string;
  position: [number, number];
  name: string;
}

// Free, keyless store lookup using OpenStreetMap data via the Overpass API.
async function fetchNearbyStores(lat: number, lng: number): Promise<MarkerInfo[]> {
  const query = `[out:json][timeout:20];node(around:5000,${lat},${lng})["shop"~"supermarket|convenience|grocery|department_store|mall"]["name"];out 30;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) throw new Error('Store lookup failed');
  const data = await res.json();
  return (data.elements || []).map((e: { id: number; lat: number; lon: number; tags: { name: string } }) => ({
    id: String(e.id),
    position: [e.lat, e.lon] as [number, number],
    name: e.tags.name,
  }));
}

export default function StoreSearchMap() {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [markers, setMarkers] = useState<MarkerInfo[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});

  useEffect(() => {
    const search = async (loc: [number, number]) => {
      setCenter(loc);
      try {
        const found = await fetchNearbyStores(loc[0], loc[1]);
        setMarkers(found);
        setSaveStatus((prev) => {
          const next: Record<string, 'idle' | 'saving' | 'saved' | 'error'> = {};
          found.forEach((m) => {
            next[m.id] = prev[m.id] || 'idle';
          });
          return next;
        });
      } catch {
        setLoadError(true);
      }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => search([pos.coords.latitude, pos.coords.longitude]),
        () => search(DEFAULT_CENTER)
      );
    } else {
      search(DEFAULT_CENTER);
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
        latitude: marker.position[0],
        longitude: marker.position[1],
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

  return (
    <div className="space-y-4">
      {loadError && <p className="text-sm text-red-600">Could not load nearby stores right now.</p>}
      <MapViewInner
        center={center}
        zoom={13}
        markers={markers.map((m) => ({ position: m.position, label: m.name }))}
      />

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

