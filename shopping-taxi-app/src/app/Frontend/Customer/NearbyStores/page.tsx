// Customer Nearby Stores page

'use client';
import StoreSearchMap from '@/app/components2/StoreSearchMap';

export default function NearbyStores() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Stores Near You</h1>
      <StoreSearchMap />
    </main>
  );
}

