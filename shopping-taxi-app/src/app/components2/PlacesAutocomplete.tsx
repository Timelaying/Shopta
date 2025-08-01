'use client';
import { FC } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from '@reach/combobox';
import '@reach/combobox/styles.css';

interface Props { onSelect: (place: { id: string; description: string; location: { lat: number; lng: number } }) => void; }
export const PlacesAutocomplete: FC<Props> = ({ onSelect }) => {
  const { ready, value, suggestions, setValue, clearSuggestions } = usePlacesAutocomplete({ requestOptions: { /* bounds, etc */ } });
  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();
    const results = await getGeocode({ address });
    const { lat, lng } = await getLatLng(results[0]);
    onSelect({ id: results[0].place_id, description: address, location: { lat, lng } });
  };
  return (
    <Combobox onSelect={handleSelect} aria-label="Store location">
      <ComboboxInput value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)} disabled={!ready} placeholder="Search location..." />
      <ComboboxPopover>
        <ComboboxList>
          {suggestions.status === 'OK' && suggestions.data.map(
            ({ place_id, description }: { place_id: string; description: string }) => (
              <ComboboxOption key={place_id} value={description} />
            )
          )}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
};