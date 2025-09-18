'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlacesAutocomplete } from '../../../components2/PlacesAutocomplete';
import { Place, Stop, persistPlaceAsStore, submitTrip } from './tripPlannerUtils';

enum Step { Select=0, Review=1, Confirm=2 }

export default function TripPlanner() {
  const [step, setStep] = useState<Step>(Step.Select);
  const [stops, setStops] = useState<Stop[]>([]);
  const [vehicleSize, setVehicleSize] = useState<'small'|'standard'|'large'>('standard');
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const addStop = async (place: unknown) => {
    setError(null);
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
      if (stops.find((s) => s.id === stop.id) || stops.length >= maxStops) return;
      try {
        const persisted = await persistPlaceAsStore(stop);
        setStops((prev) => {
          if (prev.find((existing) => existing.id === persisted.id) || prev.length >= maxStops) {
            return prev;
          }
          return [...prev, persisted];
        });
      } catch (err) {
        console.error('Failed to persist stop', err);
        setError('Unable to save this stop. Please try again.');
      }
    }
  };

  const removeStop = (index: number) => {
    if (index < currentStopIndex) return;
    setStops((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setCurrentStopIndex((current) => Math.min(current, updated.length));
      return updated;
    });
  };

  const submit = async () => {
    setError(null);
    try {
      setIsSubmitting(true);
      await submitTrip(stops, vehicleSize, router);
    } catch (err) {
      console.error('Trip submission failed', err);
      setError(err instanceof Error ? err.message : 'Failed to start trip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
                {i+1}. {s.storeName}
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
          <ol>{stops.map(s=><li key={s.id}>{s.storeName}<div className="text-sm text-gray-600">{s.storeAddress}</div></li>)}</ol>
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
          <button onClick={submit} disabled={isSubmitting || !stops.length}>
            {isSubmitting ? 'Starting…' : 'Start'}
          </button>
        </>
      )}
      {error && <p className="text-red-600" role="alert">{error}</p>}
    </main>
  );
}
