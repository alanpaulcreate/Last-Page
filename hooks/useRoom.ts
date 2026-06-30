"use client";
import { useState, useEffect } from "react";
import { subscribeToRoom } from "@/lib/firestore";
import { Room } from "@/types";
import { useAuth } from "./useAuth";

export function useRoom(roomId: string | null) {
  const { user, loading: authLoading } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    if (!roomId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToRoom(
      roomId,
      (r) => {
        if (r === null) {
          setError("Room not found");
        }
        setRoom(r);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, [roomId, user, authLoading]);

  return { room, loading: loading || authLoading, error };
}
