// src/app/Frontend/Admin/Auth/Register/page.tsx
'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import apiClient from '@/app/services/apiClient';
import { z } from 'zod';
import { isAxiosError } from 'axios';

const AdminRegisterSchema = z
  .object({ email: z.string().email(), username: z.string().min(3), password: z.string().min(6), confirmPassword: z.string() })
  .refine(d => d.password === d.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] });
export default function AdminRegister() {
  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle'|'registering'|'success'>('idle');
  const router = useRouter();
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => { setForm(p=>({...p,[e.target.name]:e.target.value})); setError(null);} ;
  const handleSubmit = async (e:FormEvent) => { e.preventDefault(); const v=AdminRegisterSchema.safeParse(form);if(!v.success){setError(v.error.errors[0].message);return;} setStatus('registering'); try{ await apiClient.post('/auth/admin/register',{email:form.email,username:form.username,password:form.password},{withCredentials:true}); setStatus('success'); setTimeout(()=>router.push('/Frontend/Admin/Feed'),1000);}catch(err){setStatus('idle');if(isAxiosError(err))setError(err.response?.data.error??'Registration failed.');else setError('Registration failed.');}};
  return (<main className="flex min-h-screen items-center justify-center bg-gray-50 px-4"><div className="w-full max-w-md bg-white p-8 shadow-md rounded-xl space-y-6"><h2 className="text-center text-2xl font-bold">Admin Register</h2><form onSubmit={handleSubmit} className="space-y-4"><Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required/><Input name="username" type="text" placeholder="Username" value={form.username} onChange={handleChange} required/><Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required/><Input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required/>{error&&<p className="text-red-500">{error}</p>}{status==='success'&&<p className="text-green-600">Registered! Redirecting…</p>}<Button type="submit" disabled={status==='registering'} className="w-full">{status==='registering'?'Registering…':'Register'}</Button></form><p className="text-center text-sm">Have an account? <Link href="/Frontend/Admin/Auth/Login" className="text-blue-600 hover:underline">Log in</Link></p></div></main>);
}