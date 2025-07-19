'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import axios from 'axios';                     // or import your apiClient
import { z } from 'zod';

// 1) Define a Zod schema for registration
const RegisterSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 2) Validate with Zod
    const result = RegisterSchema.safeParse(form);
    if (!result.success) {
      // show first validation error
      setError(result.error.errors[0].message);
      return;
    }

    try {
      // 3) Use Axios to call your backend
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`,
        {
          email: form.email,
          username: form.username,
          password: form.password,
        },
        { withCredentials: true }
      );
      router.push('/Feed');
    } catch (err: any) {
      // network or server error
      setError(
        err.response?.data?.error ||
          'Registration failed. Please try again later.'
      );
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
