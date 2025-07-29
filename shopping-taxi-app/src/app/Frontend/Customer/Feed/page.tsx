// Customer Feed (src/app/Frontend/Customer/Feed/page.tsx)

'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/app/services/apiClient';
import StoreList from '@/app/components2/StoreList';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Store {
  id: number;
  name: string;
  address: string;
}

export default function CustomerFeed() {
  const [user, setUser] = useState<User | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [filter, setFilter] = useState('');
  const router = useRouter();

  // 1. Seed static store data once:- these are static stores not real stores
  // In a real app, you would fetch this from an API
  // Here we just simulate it with hardcoded data
  // This could be replaced with a real API call to fetch stores
  // For example, you might have an endpoint like /api/stores that returns a list
  // of stores from your database.
  useEffect(() => {
    setStores([
      { id: 1, name: 'Alpha Groceries', address: '123 Main St' },
      { id: 2, name: 'Budget Market', address: '456 Elm St' },
      // ... up to N
    ]);
  }, []);

  // 2. Fetch the current user; redirect to login on error
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('No token');
        const res = await apiClient.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch {
        router.push('/Frontend/Customer/Auth/Login');
      }
    };
    fetchMe();
  }, [router]);

  // 3. Compute filtered list for rendering
  const filteredStores = stores.filter((s) =>
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
        stores={filteredStores}
        onSelect={(id) => router.push(`/Frontend/Customer/StoreDetail/${id}`)}
      />
    </main>
  );
}
