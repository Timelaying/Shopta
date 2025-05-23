/* this is first landing page, probably i delete the previous one */
/* set up nextjs app with tailwindcss */
'use client';   
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-12 text-center">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          Smart Shopping, Simplified Commutes
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Plan your shopping trips with ease. Discover store locations, optimize travel, and save time and money on your errands—all in one app.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/Frontend/Feed">
            <Button size="lg">Enter App</Button>
          </Link>
          <Link href="/Frontend/Auth/Login">
            <Button size="lg" variant="outline">Login</Button>
          </Link>
        </div>
      </div>

      <footer className="mt-16 text-sm text-gray-500">
        Built by Timilehin Makanjuola • © {new Date().getFullYear()}
      </footer>
    </main>
  );
}

