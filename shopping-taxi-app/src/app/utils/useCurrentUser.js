import { useEffect, useState } from "react";
import axios from "axios";

export default function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me", {
          withCredentials: true, // if using cookies
        });
        setUser(res.data.user); // adjust based on your response
      } catch (err) {
        console.error("Failed to fetch current user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
}
