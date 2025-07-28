// Driver Feed (src/app/Frontend/Driver/Feed/page.tsx)

'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/app/services/apiClient';
import { useRouter } from 'next/navigation';

interface User { id: number; username: string; email: string; role: string; }

export default function DriverFeed() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await apiClient.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.user.role !== 'driver') throw new Error();
        setUser(res.data.user);
      } catch {
        router.push('/Frontend/Driver/Auth/Login');
      }
    };
    fetchMe();
  }, [router]);

  if (!user) return <p>Loading…</p>;
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Driver Dashboard</h1>
      <p>Welcome, {user.username}!</p>
      {/* driver-specific content here */}
    </main>
  );
}
