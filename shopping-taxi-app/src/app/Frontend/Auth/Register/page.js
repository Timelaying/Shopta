'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import apiClient from '@/app/services/apiClient'; // or axios if you prefer
import { z } from 'zod';

// 1) Zod schema for client-side validation
const RegisterSchema = z
  .object({
    email: z.string().email('Must be a valid email'),
    username: z.string().min(3, 'At least 3 characters'),
    password: z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // 2) Validate
    const result = RegisterSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    try {
      // 3) Call your backend
      await apiClient.post(
        '/auth/register',
        {
          email: form.email,
          username: form.username,
          password: form.password,
        },
        { withCredentials: true }
      );

      router.push('/Feed');
    } catch (err: unknown) {
      // 4) Narrow and display error
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        (err as any).response?.data?.error
      ) {
        setError((err as any).response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 shadow-md rounded-xl">
        <h2 className="text-center text-2xl font-bold">
          Create your account
        </h2>

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

          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/Auth/Login"
            className="text-blue-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
