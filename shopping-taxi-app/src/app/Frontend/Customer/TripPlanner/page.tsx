// src/app/Frontend/Customer/TripPlanner/page.tsx
'use client';
import { useState } from 'react';
import apiClient from '@/app/services/apiClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Store { id: number; name: string; address: string; }
const STORES: Store[] = [
  { id: 1, name: 'Alpha', address: '123 Main' },
  { id: 2, name: 'Beta',  address: '456 Elm' },
  // … static seed
];

enum Step { Select = 0, Review = 1, Confirm = 2 }
export default function TripPlanner() {
  const [step, setStep] = useState<Step>(Step.Select);
  const [selected, setSelected] = useState<Store[]>([]);
  const router = useRouter();

  const toggleStore = (s: Store) => {
    setSelected(sel =>
      sel.find(x => x.id === s.id)
        ? sel.filter(x => x.id !== s.id)
        : sel.length < 10
          ? [...sel, s]
          : sel
    );
  };

  const submit = async () => {
    const stops = selected.map((s, i) => ({ store_id: s.id, sequence: i + 1 }));
    const res = await apiClient.post('/trips', { stops }, { withCredentials: true });
    router.push(`/Frontend/Customer/StoreDetail/${res.data.tripId}`);
  };

  return (
    <main className="p-8">
      {step === Step.Select && (
        <>
          <h1>Select up to 10 stores</h1>
          <ul className="grid grid-cols-2 gap-4">
            {STORES.map(s => (
              <li key={s.id} className={`p-4 border ${selected.some(x=>x.id===s.id)?'bg-blue-100':''}`}
                  onClick={() => toggleStore(s)}>
                <h2>{s.name}</h2>
                <p>{s.address}</p>
              </li>
            ))}
          </ul>
          <Button onClick={() => setStep(Step.Review)} disabled={selected.length===0}>Review</Button>
        </>
      )}
      {step === Step.Review && (
        <>  <h1>Review your route</h1>
          <ol className="list-decimal ml-6 space-y-2">
            {selected.map(s => <li key={s.id}>{s.name}</li>)}
          </ol>
          <Button onClick={() => setStep(Step.Confirm)}>Confirm</Button>
        </>
      )}
      {step === Step.Confirm && (
        <>  <h1>Confirm Trip</h1>
          <Button onClick={submit}>Start Trip</Button>
        </>
      )}
    </main>
  );
}