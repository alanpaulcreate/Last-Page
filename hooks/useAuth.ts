"use client";
import { useState, useEffect } from "react";
import { onAuthChange } from "@/lib/auth";
import { AppUser } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, loading };
}
