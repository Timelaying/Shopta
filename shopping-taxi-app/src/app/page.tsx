import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-12 text-center">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          Plan Smarter Shopping, Travel Efficiently
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          A better way to combine shopping and commuting — save time, money, and
          energy.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/Frontend/Customer/Auth/Login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/Frontend/Customer/Auth/Register">
            <Button size="lg" variant="outline">
              Register
            </Button>
          </Link>
        </div>
      </div>

      <footer className="mt-16 text-sm text-gray-500">
        Built by Timilehin Makanjuola • © {new Date().getFullYear()}
      </footer>
    </main>
  );
}
