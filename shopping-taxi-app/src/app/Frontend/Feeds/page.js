"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FeedPage() {
  const [username, setUsername] = useState("");
  const [feedItems, setFeedItems] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch("/api/users/me");
        if (!userRes.ok) {
          router.push("/Frontend/Auth/Login"); // 🔒 redirect if unauthenticated
          return;
        }
        const user = await userRes.json();
        setUsername(user.username);

        const feedRes = await fetch("/api/feed");
        const feed = await feedRes.json();
        setFeedItems(feed);
      } catch (err) {
        console.error("Feed fetch error:", err);
        router.push("/Frontend/Auth/Login");
      }
    }

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        Welcome back, {username || "..."}
      </h1>

      <div className="grid gap-6 max-w-4xl mx-auto">
        {feedItems.length > 0 ? (
          feedItems.map((item, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-2">
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="text-gray-600">{item.description}</p>
                {item.action && (
                  <Button onClick={() => router.push(item.action.link)}>
                    {item.action.label}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500">Loading feed...</p>
        )}
      </div>
    </main>
  );
}
