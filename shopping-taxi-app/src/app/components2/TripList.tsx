// src/components/TripList.tsx
import { FC } from 'react';
interface Stop { id: number; store_id: number; sequence: number; visited: boolean; }
interface Trip { id: number; stops: Stop[]; }
interface Props { trips: Trip[]; onSelect: (id: number) => void; }
const TripList: FC<Props> = ({ trips, onSelect }) => (
  <ul className="space-y-4">
    {trips.map(t => (
      <li key={t.id} className="p-4 border rounded hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(t.id)}>
        <h2 className="text-lg font-semibold">Trip #{t.id}</h2>
        <p>{t.stops.filter(s => !s.visited).length} stops remaining</p>
      </li>
    ))}
  </ul>
);
export default TripList;
