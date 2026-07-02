"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  createRoom,
  joinRoom,
  subscribeToRoom,
  fetchPublicRooms,
  requestToJoinRoom,
  approveJoinRequest,
  declineJoinRequest
} from "@/lib/firestore";
import { GameType, GameSettings, Player, Room } from "@/types";
import RoomCodeDisplay from "@/components/ui/RoomCodeDisplay";
import Link from "next/link";
import React from "react";
import {
  HangmanGameIcon,
  SosGameIcon,
  DotsGameIcon,
  NamePlaceGameIcon,
  PublicIcon,
  ShieldIcon,
  CheckIcon,
  CloseIcon,
  LinkIcon,
  KeyIcon,
  PencilIcon,
  BingoGameIcon,
  TicTacToeGameIcon
} from "@/components/ui/Icons";

const GAME_ICONS: Record<GameType, React.ComponentType<{ size?: number; className?: string }>> = {
  hangman: HangmanGameIcon,
  sos: SosGameIcon,
  "dots-and-boxes": DotsGameIcon,
  "name-place": NamePlaceGameIcon,
  bingo: BingoGameIcon,
  "tic-tac-toe": TicTacToeGameIcon,
};

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
  const [mode, setMode] = useState<"menu" | "creating" | "joining" | "requesting">("menu");
  const [roomCode, setRoomCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [joinedPlayers, setJoinedPlayers] = useState<Player[]>([]);
  const [joinRequests, setJoinRequests] = useState<Player[]>([]);
  const [requestStatus, setRequestStatus] = useState<"pending" | "declined">("pending");

  // Custom Settings
  const [isPublic, setIsPublic] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);

  // Public Rooms
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname + window.location.search;
      router.replace(`/auth?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [loading, user, router]);

  // Fetch public rooms
  useEffect(() => {
    if (mode === "menu" && user) {
      setLoadingRooms(true);
      fetchPublicRooms(gameType)
        .then(setPublicRooms)
        .catch((err) => console.error("Error fetching public rooms:", err))
        .finally(() => setLoadingRooms(false));
    }
  }, [mode, gameType, user]);

  // Subscribe to room for host / approval listing
  useEffect(() => {
    if (mode !== "creating" || !createdCode) {
      setJoinedPlayers([]);
      setJoinRequests([]);
      return;
    }
    const unsub = subscribeToRoom(createdCode, (room) => {
      if (room) {
        setJoinedPlayers(room.players);
        setJoinRequests(room.joinRequests || []);
      }
    });
    return unsub;
  }, [mode, createdCode]);

  // Subscribe to room for guest approval status
  useEffect(() => {
    if (mode !== "requesting" || !roomCode || !user) return;
    
    const targetCode = roomCode.trim().toUpperCase();
    const unsub = subscribeToRoom(targetCode, (room) => {
      if (!room) {
        setError("Room no longer exists.");
        setMode("menu");
        return;
      }
      
      const inPlayers = room.players.some((p) => p.uid === user.uid);
      if (inPlayers) {
        router.push(`/games/${gameType}/${room.roomId}`);
        return;
      }
      
      const inRequests = room.joinRequests?.some((r) => r.uid === user.uid);
      if (!inRequests && !inPlayers) {
        setRequestStatus("declined");
      }
    });
    
    return unsub;
  }, [mode, roomCode, user, gameType, router]);

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
      const code = await createRoom(gameType, asPlayer(), {
        ...settings,
        isPublic,
        requireApproval,
      });
      router.push(`/games/${gameType}/${code}`);
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
    const targetCode = roomCode.trim().toUpperCase();
    try {
      const room = await joinRoom(targetCode, asPlayer());
      if (!room) {
        setError("Room not found. Check the code and try again.");
        return;
      }
      
      if (room.settings?.requireApproval && room.hostId !== user.uid && !room.players.some(p => p.uid === user.uid)) {
        const success = await requestToJoinRoom(targetCode, asPlayer());
        if (!success) {
          setError("Room is full or unavailable.");
          return;
        }
        setRequestStatus("pending");
        setMode("requesting");
      } else {
        router.push(`/games/${gameType}/${room.roomId}`);
      }
    } catch {
      setError("Couldn't join room. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinDirect = async (code: string) => {
    setIsLoading(true);
    setError("");
    try {
      const room = await joinRoom(code, asPlayer());
      if (!room) {
        setError("Room is full or no longer available.");
        return;
      }
      
      if (room.settings?.requireApproval && room.hostId !== user.uid && !room.players.some(p => p.uid === user.uid)) {
        setRoomCode(code);
        const success = await requestToJoinRoom(code, asPlayer());
        if (!success) {
          setError("Room is full or unavailable.");
          return;
        }
        setRequestStatus("pending");
        setMode("requesting");
      } else {
        router.push(`/games/${gameType}/${room.roomId}`);
      }
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
          <div className="flex justify-center mb-4">
            {React.createElement(GAME_ICONS[gameType], { size: 64, className: "text-ink animate-pulse" })}
          </div>
          <h1 className="font-hand text-3xl font-bold text-ink">{title}</h1>
          <p className="text-sm text-pencil/95 mt-1">{description}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-margin/30 rounded text-red-margin text-sm font-hand text-center">
            {error}
          </div>
        )}

        {mode === "menu" && (
          <div className="space-y-4">
            {settingsUI && (
              <div className="p-4 bg-paper/60 rounded border border-blue-lines/30">
                {settingsUI}
              </div>
            )}
            
            {/* Custom Room Settings */}
            <div className="flex flex-col gap-2.5 p-4 bg-paper/60 rounded border border-blue-lines/30 text-left font-hand">
              <label className="flex items-center gap-2.5 text-ink text-base cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="accent-ink w-4.5 h-4.5 cursor-pointer"
                />
                <PublicIcon size={18} className="text-pencil/80 inline" /> Make Room Public (List in Lobby)
              </label>
              <label className="flex items-center gap-2.5 text-ink text-base cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="accent-ink w-4.5 h-4.5 cursor-pointer"
                />
                <ShieldIcon size={18} className="text-pencil/80 inline" /> Require Host Approval to Join
              </label>
            </div>

            <button
              onClick={handleCreate}
              disabled={isLoading}
              className="sketch-btn-primary sketch-btn w-full py-3 text-lg flex items-center justify-center gap-2"
            >
              <PencilIcon size={20} /> {isLoading ? "Creating..." : "Create Room"}
            </button>
            <button
              onClick={() => setMode("joining")}
              className="sketch-btn w-full py-3 text-lg flex items-center justify-center gap-2"
            >
              <LinkIcon size={20} /> Join with Code
            </button>

            {/* Available Public Rooms list */}
            <div className="mt-6 pt-5 border-t-2 border-dashed border-blue-lines/40">
              <h2 className="font-hand text-xl font-bold text-ink mb-3 text-center flex items-center justify-center gap-1.5">
                <PublicIcon size={18} /> Active Public Rooms
              </h2>
              {loadingRooms ? (
                <p className="text-center text-sm font-hand text-pencil/80 animate-pulse">
                  Searching for rooms...
                </p>
              ) : publicRooms.length === 0 ? (
                <p className="text-center text-sm font-hand text-pencil/65 italic">
                  No public rooms active right now.
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {publicRooms.map((r) => (
                    <div
                      key={r.roomId}
                      className="flex items-center justify-between p-3 bg-paper/85 rounded border border-blue-lines/30"
                    >
                      <div className="text-left font-hand">
                        <p className="text-base font-bold text-ink leading-tight">
                          Room: {r.roomId}
                        </p>
                        <p className="text-xs text-pencil/70">
                          Players: {r.players.length}/{(r.gameType === "name-place" || r.gameType === "bingo") ? 4 : 2}
                        </p>
                      </div>
                      <button
                        onClick={() => handleJoinDirect(r.roomId)}
                        disabled={isLoading}
                        className="sketch-btn py-1 px-3 text-xs"
                      >
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {mode === "creating" && createdCode && (
          <div className="space-y-6">
            <RoomCodeDisplay code={createdCode} />
            <p className="text-center text-sm text-pencil/95 font-hand flex flex-col items-center gap-1">
              <span>Share this code with your friend!</span>
              {joinedPlayers.filter(p => p.uid !== user.uid).length > 0 ? (
                <span className="text-green-600 font-semibold flex items-center gap-1 animate-pulse">
                  <CheckIcon size={16} /> {joinedPlayers.filter(p => p.uid !== user.uid).map(p => p.displayName).join(", ")} joined!
                </span>
              ) : (
                <span className="text-pencil/80 italic">Waiting for them to join...</span>
              )}
            </p>

            {/* Host Join Approval requests list */}
            {requireApproval && joinRequests.length > 0 && (
              <div className="p-4 bg-paper/60 rounded border border-blue-lines/40 space-y-3 font-hand text-left">
                <h3 className="font-bold text-ink text-base flex items-center gap-1.5">
                  <ShieldIcon size={18} /> Join Requests ({joinRequests.length})
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {joinRequests.map((req) => (
                    <div key={req.uid} className="flex items-center justify-between border-b border-blue-lines/20 pb-2">
                      <span className="text-sm text-pencil font-semibold">{req.displayName}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => approveJoinRequest(createdCode, req)}
                          className="bg-green-600 text-white rounded py-1 px-2.5 text-xs hover:bg-green-700 transition-colors cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => declineJoinRequest(createdCode, req.uid)}
                          className="bg-red-margin text-white rounded py-1 px-2.5 text-xs hover:bg-red-700 transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={enterRoom}
              disabled={joinedPlayers.length < 2 && gameType !== "name-place"} // Need at least 2 players
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
              <label htmlFor="room-code-input" className="font-hand text-ink text-base block mb-2 flex items-center justify-center gap-1.5">
                <KeyIcon size={18} /> Enter Room Code
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

        {mode === "requesting" && (
          <div className="space-y-6 font-hand text-center">
            <div className="flex justify-center mb-2">
              <ShieldIcon size={48} className="text-ink animate-pulse" />
            </div>
            
            {requestStatus === "pending" ? (
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-ink">Approval Pending</h2>
                <p className="text-sm text-pencil/90 leading-relaxed">
                  Your request to join room <strong>{roomCode}</strong> has been sent to the host. Please wait for them to approve you.
                </p>
                <div className="font-hand text-xs text-pencil/70 animate-pulse mt-4">
                  Waiting for host...
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-center mb-1">
                  <CloseIcon size={48} className="text-red-margin" />
                </div>
                <h2 className="text-2xl font-bold text-red-margin">Request Declined</h2>
                <p className="text-sm text-pencil/90 leading-relaxed">
                  Your request to join room <strong>{roomCode}</strong> was declined by the host.
                </p>
              </div>
            )}

            <button
              onClick={() => { setMode("menu"); setRoomCode(""); setError(""); }}
              className="sketch-btn w-full py-2.5 text-sm"
            >
              ← Back to Lobby
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
