"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createRoom, joinRoom, subscribeToRoom } from "@/lib/firestore";
import { GameType, GameSettings, Player } from "@/types";
import RoomCodeDisplay from "@/components/ui/RoomCodeDisplay";
import Link from "next/link";

interface GameLobbyProps {
  gameType: GameType;
  title: string;
  icon: string;
  description: string;
  color: string;
  settingsUI?: React.ReactNode;
  settings?: GameSettings;
  maxPlayers?: number;
}

export default function GameLobby({
  gameType,
  title,
  icon,
  description,
  color,
  settingsUI,
  settings = {},
  maxPlayers = 2,
}: GameLobbyProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"menu" | "creating" | "joining">("menu");
  const [roomCode, setRoomCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [joinedPlayers, setJoinedPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (mode !== "creating" || !createdCode) {
      setJoinedPlayers([]);
      return;
    }
    const unsub = subscribeToRoom(createdCode, (room) => {
      if (room) {
        setJoinedPlayers(room.players);
      }
    });
    return unsub;
  }, [mode, createdCode]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-hand text-ink text-2xl animate-pulse">
          Sharpening pencils...
        </div>
      </div>
    );
  }

  const asPlayer = (): Player => ({
    uid: user.uid,
    displayName: user.displayName,
    isGuest: user.isGuest,
    score: 0,
    isReady: false,
    color: "#1F4E79",
  });

  const handleCreate = async () => {
    setIsLoading(true);
    setError("");
    try {
      const code = await createRoom(gameType, asPlayer(), settings);
      setCreatedCode(code);
      setMode("creating");
    } catch {
      setError("Couldn't create room. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!roomCode.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const room = await joinRoom(roomCode.trim().toUpperCase(), asPlayer());
      if (!room) {
        setError("Room not found. Check the code and try again.");
        return;
      }
      router.push(`/games/${gameType}/${room.roomId}`);
    } catch {
      setError("Couldn't join room. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const enterRoom = () => {
    router.push(`/games/${gameType}/${createdCode}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pl-6 sm:pl-24 py-12">
      <div
        className="sticky-card w-full max-w-md p-8 fade-in-up"
        style={{ "--card-rot": "-1deg", backgroundColor: color } as React.CSSProperties}
      >
        {/* Tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 rounded-sm opacity-60 bg-blue-lines border border-blue-lines/50" />

        <Link href="/" className="text-pencil/90 hover:text-ink text-sm font-hand transition-colors mb-4 block">
          ← Back to all games
        </Link>

        <div className="text-center mb-8">
          <span className="text-5xl block mb-2">{icon}</span>
          <h1 className="font-hand text-3xl font-bold text-ink">{title}</h1>
          <p className="text-sm text-pencil/95 mt-1">{description}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-margin/30 rounded text-red-margin text-sm font-hand text-center">
            {error}
          </div>
        )}

        {mode === "menu" && (
          <div className="space-y-3">
            {settingsUI && (
              <div className="mb-4 p-4 bg-paper/60 rounded border border-blue-lines/30">
                {settingsUI}
              </div>
            )}
            <button
              onClick={handleCreate}
              disabled={isLoading}
              className="sketch-btn-primary sketch-btn w-full py-3 text-lg"
            >
              {isLoading ? "Creating..." : "✏️ Create Room"}
            </button>
            <button
              onClick={() => setMode("joining")}
              className="sketch-btn w-full py-3 text-lg"
            >
              🔗 Join with Code
            </button>
          </div>
        )}

        {mode === "creating" && createdCode && (
          <div className="space-y-6">
            <RoomCodeDisplay code={createdCode} />
            <p className="text-center text-sm text-pencil/95 font-hand">
              Share this code with your friend!<br/>
              {joinedPlayers.filter(p => p.uid !== user.uid).length > 0 ? (
                <span className="text-green-600 font-semibold block mt-1 animate-pulse">
                  ✓ {joinedPlayers.filter(p => p.uid !== user.uid).map(p => p.displayName).join(", ")} joined!
                </span>
              ) : (
                "Waiting for them to join..."
              )}
            </p>
            <button
              onClick={enterRoom}
              className="sketch-btn-primary sketch-btn w-full py-3 text-lg"
            >
              Enter Room →
            </button>
            <button
              onClick={() => { setMode("menu"); setCreatedCode(""); }}
              className="sketch-btn w-full py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {mode === "joining" && (
          <div className="space-y-4">
            <div>
              <label htmlFor="room-code-input" className="font-hand text-ink text-base block mb-2">
                🔑 Enter Room Code
              </label>
              <input
                id="room-code-input"
                type="text"
                className="notebook-input text-center text-2xl tracking-widest uppercase"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="A B C D E F"
                maxLength={6}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
            </div>
            <button
              onClick={handleJoin}
              disabled={isLoading || roomCode.length !== 6}
              className="sketch-btn-primary sketch-btn w-full py-3 text-lg"
            >
              {isLoading ? "Joining..." : "Join Game"}
            </button>
            <button
              onClick={() => { setMode("menu"); setRoomCode(""); setError(""); }}
              className="sketch-btn w-full py-2 text-sm"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
