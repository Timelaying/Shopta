// Example: StoreList component (src/components/StoreList.tsx)

import { FC } from 'react';

interface Store { id: number; name: string; address: string; }
interface Props { stores: Store[]; onSelect: (id: number) => void; }

const StoreList: FC<Props> = ({ stores, onSelect }) => (
  <ul className="space-y-4">
    {stores.map(s => (
      <li key={s.id} className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
          onClick={() => onSelect(s.id)}>
        <h2 className="text-xl font-semibold">{s.name}</h2>
        <p>{s.address}</p>
      </li>
    ))}
  </ul>
);

export default StoreList;