// src/app/Frontend/Customer/Auth/Register/page.tsx
'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import apiClient from '@/app/services/apiClient';
import { z } from 'zod';
import { AxiosError, isAxiosError } from 'axios';

const RegisterSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'registering' | 'success'>('idle');
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = RegisterSchema.safeParse(form);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setStatus('registering');                // 6. show busy state
    try {
      await apiClient.post(
        'http://localhost:5001/api/users/auth/register',
        { email: form.email, username: form.username, password: form.password },
        { withCredentials: true }
      );
      setStatus('success');
      // 6. let user know success
      // 7. Redirect after a short pause
      setTimeout(() => router.push('/Frontend/Customer/Auth/Login'), 1000);
    } catch (err: unknown) {
      setStatus('idle');
      if (isAxiosError(err)) {
        const data = (err as AxiosError<{ error: string }>).response?.data;
        setError(data?.error ?? 'Registration failed.');
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 shadow-md rounded-xl">
        <h2 className="text-center text-2xl font-bold">Create your account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            name="username"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
          {status === 'success' && <p className="text-green-600">Registered! Redirecting to login…</p>}
          <Button type="submit" disabled={status === 'registering'} className="w-full">
            {status === 'registering' ? 'Registering…' : 'Register'}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 space-x-2">
          <span>Already have an account?</span>
          <Link href="/Frontend/Customer/Auth/Login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
        <p className="text-center text-sm text-gray-600 space-x-2">
          <span>Are you a driver?</span>
          <Link href="/Frontend/Driver/Auth/Register" className="text-blue-600 hover:underline">
            Register as Driver
          </Link>
        </p>
      </div>
    </main>
  );
}