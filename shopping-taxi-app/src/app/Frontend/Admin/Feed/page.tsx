// src/app/Frontend/Admin/Feed/page.tsx
'use client';
import { useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/app/services/apiClient';

interface User { id:number; username:string; email:string; role:string; }

export default function AdminFeed(){
  const [user,setUser]=useState<User|null>(null);
  const router=useRouter();
  useEffect(()=>{const fetchMe=async()=>{try{const token=localStorage.getItem('accessToken');const res=await apiClient.get('/auth/me',{headers:{Authorization:`Bearer ${token}`}});if(res.data.user.role!=='admin')throw new Error();setUser(res.data.user);}catch{router.push('/Frontend/Admin/Auth/Login');}};fetchMe();},[router]);
  if(!user) return <p>Loading…</p>;
  return(
    <main className="p-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p>Welcome, {user.username}!</p>
      {/* admin-specific content here */}
    </main>
  );
}