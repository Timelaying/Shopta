// Customer Feed (src/app/Frontend/Customer/Feed/page.tsx)

'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/app/services/apiClient';
import StoreList from '@/app/components2/StoreList';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  username: string;
  email: string;
};

type Store = {
  id: number;
  name: string;
  address: string;
};

export default function CustomerFeed() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filter, setFilter] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    apiClient
      .get('/stores')
      .then(r => setStores(r.data.stores))
      .catch(() => router.push('/Frontend/Customer/Auth/Login'));
  }, [router]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        setUser(res.data.user);
      } catch {
        router.push('/Frontend/Customer/Auth/Login');
      }
    };
    fetchMe();
  }, [router]);

  const filtered = stores.filter((s) =>
    s.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (!user) return <p>Loading…</p>;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Welcome, {user.username}!</h1>
      <p>Your email: {user.email}</p>

      <input
        type="text"
        placeholder="Search stores..."
        className="border p-2 rounded mb-4 w-full"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <StoreList
        stores={filtered}
        onSelect={(id) => router.push(`/Frontend/Customer/StoreDetail/${id}`)}
      />
    </main>
  );
}
