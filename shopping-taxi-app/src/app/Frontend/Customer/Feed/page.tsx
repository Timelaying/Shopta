// Customer Feed (src/app/Frontend/Customer/Feed/page.tsx)

'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/app/services/apiClient';
import { useRouter } from 'next/navigation';

interface User { id: number; username: string; email: string; }

export default function CustomerFeed() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await apiClient.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch {
        router.push('/Frontend/Customer/Auth/Login');
      }
    };
    fetchMe();
  }, [router]);

  if (!user) return <p>Loading…</p>;
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Welcome, {user.username}!</h1>
      <p>Your email: {user.email}</p>
      {/* Add customer-specific feed items here */}
    </main>
  );
}