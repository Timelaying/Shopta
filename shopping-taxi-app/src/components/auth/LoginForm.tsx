'use client';
import { useState, ChangeEvent, FormEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { useAuth } from '@/app/hooks/useAuth';

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

interface LoginFormProps {
  title: string;
  redirectPath: string;
  registerHref: string;
  registerText?: string;
  children?: ReactNode;
}

export function LoginForm({ title, redirectPath, registerHref, registerText = 'Register', children }: LoginFormProps) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = LoginSchema.safeParse(form);
    if (!v.success) {
      setError(v.error.errors[0].message);
      return;
    }
    setStatus('loading');
    try {
      await login({ email: form.email, password: form.password });
      router.push(redirectPath);
    } catch (err: unknown) {
      setStatus('idle');
      if (isAxiosError(err)) setError(err.response?.data.error ?? 'Login failed.');
      else setError('Login failed.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 shadow-md rounded-xl space-y-6">
        <h2 className="text-center text-2xl font-bold">{title}</h2>
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
          <Link href={registerHref} className="text-blue-600 hover:underline">
            {registerText}
          </Link>
        </p>
        {children}
      </div>
    </main>
  );
}
