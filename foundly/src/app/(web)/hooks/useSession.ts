"use client";
import { useState, useEffect } from "react";

interface SessionData {
  userId?: string;
  sessionId?: string;
}

export function useSession() {
  const [session, setSession] = useState<SessionData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/session");
        const data = await res.json();
        if (data.session) {
          setSession(data.session);
        }
      } catch (err) {
        console.error("Failed to fetch session", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSession();
  }, []);

  return { session, isLoading };
}
