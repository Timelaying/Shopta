// Driver Login (src/app/Frontend/Driver/Auth/Login/page.tsx)
'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import apiClient from '@/app/services/apiClient';
import { z } from 'zod';
import { isAxiosError } from 'axios';

const DriverLoginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export default function DriverLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(null); };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = DriverLoginSchema.safeParse(form);
    if (!v.success) { setError(v.error.errors[0].message); return; }
    setStatus('loading');
    try {
      const res = await apiClient.post('/auth/login', { email: form.email, password: form.password }, { withCredentials: true });
      localStorage.setItem('accessToken', res.data.accessToken);
      router.push('/Frontend/Driver/Feed');
    } catch (err: unknown) {
      setStatus('idle');
      if (isAxiosError(err)) setError(err.response?.data.error ?? 'Login failed.'); else setError('Login failed.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 shadow-md rounded-xl space-y-6">
        <h2 className="text-center text-2xl font-bold">Driver Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit" disabled={status==='loading'} className="w-full">
            {status==='loading' ? 'Logging in…' : 'Log In'}
          </Button>
        </form>
        <p className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/Frontend/Driver/Auth/Register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
