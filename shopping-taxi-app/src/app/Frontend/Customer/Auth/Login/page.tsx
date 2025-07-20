'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import apiClient from '@/app/services/apiClient';
import { AxiosError, isAxiosError } from 'axios';
import { z } from 'zod';

// Zod schema for login form
const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validation = LoginSchema.safeParse(form);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    try {
      const res = await apiClient.post(
        '/auth/login',
        { email: form.email, password: form.password },
        { withCredentials: true }
      );
      localStorage.setItem('accessToken', res.data.accessToken);
      router.push('/Feed');
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ error: string }>;
        setError(axiosErr.response?.data.error ?? 'Login failed.');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 shadow-md rounded-xl">
        <h2 className="text-center text-2xl font-bold">Log in to your account</h2>
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
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            Log In
          </Button>
        </form>
                <p className="text-center text-sm text-gray-600 space-x-2">
          <span>Don&apos;t have an account?</span>
          <Link href="Frontend/Customer/Auth/Register" className="text-blue-600 hover:underline">
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