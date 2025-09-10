'use client';
import { useState } from 'react';
import apiClient from '@/app/services/apiClient';
import { useRouter } from 'next/navigation';
import { PlacesAutocomplete } from '@/app/components2/PlacesAutocomplete';

enum Step { Select=0, Review=1, Confirm=2 }
export default function TripPlanner() {
  const [step, setStep] = useState<Step>(Step.Select);
  const [stops, setStops] = useState<{id:string,description:string,location:{lat:number,lng:number}}[]>([]);
  const [vehicleSize, setVehicleSize] = useState<'small'|'standard'|'large'>('standard');
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const router = useRouter();

  type Place = {
    id: string;
    description: string;
    location: { lat: number; lng: number };
  };

  const addStop = (place: unknown) => {
    // Type guard to ensure 'place' matches the expected shape
    if (
      typeof place === 'object' &&
      place !== null &&
      'id' in place &&
      'description' in place &&
      'location' in place &&
      typeof (place as Place).id === 'string' &&
      typeof (place as Place).description === 'string' &&
      typeof (place as Place).location === 'object' &&
      (place as Place).location !== null &&
      typeof (place as Place).location.lat === 'number' &&
      typeof (place as Place).location.lng === 'number'
    ) {
      const stop = place as Place;
      const maxStops = vehicleSize === 'small' ? 5 : vehicleSize === 'large' ? 15 : 10;
      if (stops.find(s => s.id === stop.id) || stops.length >= maxStops) return;
      setStops([...stops, stop]);
    }
  };

  const removeStop = (index: number) => {
    if (index < currentStopIndex) return;
    setStops(stops.filter((_, i) => i !== index));
  };

  const submit = async () => {
    const payload = {
      stops: stops.map((s,i)=>({ store_id: 0 /* ignore id mapping for now */, sequence: i+1 })),
      vehicleSize
    };
    const res = await apiClient.post('/trips', payload, { withCredentials: true });
    router.push(`/Frontend/Customer/StoreDetail/${res.data.tripId}`);
  };

  return (
    <main className="p-8 space-y-4">
      {step===Step.Select && (
        <>
          <h2>Select Stops</h2>
          <PlacesAutocomplete onSelect={addStop} />
          <ul>
            {stops.map((s,i)=>
              <li key={s.id}>
                {i+1}. {s.description}
                <button
                  className="ml-2"
                  onClick={()=>removeStop(i)}
                  disabled={i < currentStopIndex}
                >Remove</button>
              </li>
            )}
          </ul>
          <label htmlFor="vehicle-size-select">Vehicle Size:</label>
          <select
            id="vehicle-size-select"
            value={vehicleSize}
            onChange={e => setVehicleSize(e.target.value as 'small' | 'standard' | 'large')}
          >
            <option value="small">Small</option>
            <option value="standard">Standard</option>
            <option value="large">Large</option>
          </select>
          <button disabled={stops.length===0} onClick={()=>setStep(Step.Review)}>Next</button>
        </>
      )}
      {step===Step.Review && (
        <>
          <h2>Review</h2>
          <p>Vehicle: {vehicleSize}</p>
          <ol>{stops.map(s=><li key={s.id}>{s.description}</li>)}</ol>
          <button
            onClick={()=>setCurrentStopIndex(i=>Math.min(i+1, stops.length))}
            disabled={currentStopIndex>=stops.length}
          >Next Stop</button>
          <button onClick={()=>setStep(Step.Confirm)}>Confirm</button>
        </>
      )}
      {step===Step.Confirm && (
        <>
          <h2>Start Trip</h2>
          <button onClick={submit}>Start</button>
        </>
      )}
    </main>
  );
}
