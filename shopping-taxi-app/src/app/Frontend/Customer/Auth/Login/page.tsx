// src/app/Frontend/Customer/Auth/Login/page.tsx
'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import axios, { isAxiosError } from 'axios';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const v = LoginSchema.safeParse(form);
    if (!v.success) {
      setError(v.error.errors[0].message);
      return;
    }

    setStatus('loading');
    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/login",
        { email: form.email, password: form.password },
        { withCredentials: true }
      );
      localStorage.setItem('accessToken', res.data.accessToken);
      // absolute path!
      router.push('/Frontend/Customer/Feed');
    } catch (err: unknown) {
      setStatus('idle');
      if (isAxiosError(err)) {
        setError(err.response?.data.error ?? 'Login failed.');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 shadow-md rounded-xl space-y-6">
        <h2 className="text-center text-2xl font-bold">Log in</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={status === 'loading'} className="w-full">
            {status === 'loading' ? 'Logging in…' : 'Log In'}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 space-x-2">
          <span>Don&apos;t have an account?</span>
          <Link href="/Frontend/Customer/Auth/Register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
        <p className="text-center text-sm text-gray-600 space-x-2">
          <span>Are you a driver?</span>
          <Link href="/Frontend/Driver/Auth/Login" className="text-blue-600 hover:underline">
            Driver Login
          </Link>
        </p>
      </div>
    </main>
  );
}