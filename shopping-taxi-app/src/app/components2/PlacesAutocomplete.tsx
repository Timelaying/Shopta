'use client';
import { FC, useEffect, useState } from 'react';

interface Props {
  onSelect: (place: { id: string; description: string; location: { lat: number; lng: number } }) => void | Promise<void>;
}

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

/** Place search backed by OpenStreetMap Nominatim (free, no API key). */
export const PlacesAutocomplete: FC<Props> = ({ onSelect }) => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [justSelected, setJustSelected] = useState(false);

  useEffect(() => {
    if (justSelected || value.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    // Debounce to respect Nominatim's usage policy (max ~1 request/second).
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(value)}`
        );
        if (res.ok) setSuggestions(await res.json());
      } catch {
        setSuggestions([]);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [value, justSelected]);

  const handleSelect = async (s: Suggestion) => {
    setJustSelected(true);
    setValue(s.display_name);
    setSuggestions([]);
    await onSelect({
      id: String(s.place_id),
      description: s.display_name,
      location: { lat: parseFloat(s.lat), lng: parseFloat(s.lon) },
    });
  };

  return (
    <div className="relative" aria-label="Store location">
      <input
        className="w-full rounded border border-gray-300 p-2"
        value={value}
        onChange={(e) => {
          setJustSelected(false);
          setValue(e.target.value);
        }}
        placeholder="Search location..."
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded border border-gray-200 bg-white shadow">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              className="cursor-pointer p-2 text-sm hover:bg-gray-100"
              onClick={() => handleSelect(s)}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
