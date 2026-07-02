"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useRoom } from "@/hooks/useRoom";
import { useAuth } from "@/hooks/useAuth";
import { updateGameState, updateRoomStatus, leaveRoom } from "@/lib/firestore";
import { NamePlaceState } from "@/types";
import { startRound, submitAnswers, calculateScores } from "@/lib/games/name-place";
import PlayerBadge from "@/components/ui/PlayerBadge";
import RoomCodeDisplay from "@/components/ui/RoomCodeDisplay";
import WinBurst from "@/components/ui/WinBurst";
import ChatBox from "@/components/ui/ChatBox";
import Link from "next/link";

type TextCategory = "name" | "place" | "animal" | "thing";
type TextAnswers = Record<TextCategory, string>;

const CATEGORIES: TextCategory[] = ["name", "place", "animal", "thing"];
const CAT_LABELS: Record<string, string> = {
  name: "👤 Name",
  place: "🗺️ Place",
  animal: "🐾 Animal",
  thing: "📦 Thing",
};

export default function NamePlaceGamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { room, loading } = useRoom(roomId);
  const { user } = useAuth();
  const router = useRouter();

  const [answers, setAnswers] = useState<TextAnswers>({ name: "", place: "", animal: "", thing: "" });
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showWinOverlay, setShowWinOverlay] = useState(true);

  const state = room?.gameState as NamePlaceState | undefined;
  const isHost = room?.hostId === user?.uid;
  const playerUids = room?.players.map((p) => p.uid) || [];
  const isOver = state ? state.winner !== null : false;

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname + window.location.search;
      router.replace(`/auth?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [loading, user, router]);

  // Reset win overlay state when a new game starts
  useEffect(() => {
    if (!isOver) {
      setShowWinOverlay(true);
    }
  }, [isOver]);

  // Timer countdown during answering phase
  useEffect(() => {
    if (!state || state.roundStatus !== "answering") {
      if (timerRef.current) clearInterval(timerRef.current);
      setSubmitted(false);
      return;
    }

    const startMs = state.roundStartAt?.toMillis() || Date.now();
    const endMs = startMs + state.timerSeconds * 1000;

    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endMs - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        // Auto-submit if not submitted
        if (!submitted && user) handleSubmit(true);
      }
    }, 200);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.roundStatus, state?.round]);

  if (loading || !room || !user || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-hand text-2xl text-ink animate-pulse">
          {loading ? "Sharpening pencils..." : "Room not found!"}
        </p>
      </div>
    );
  }

  const handleStartRound = async () => {
    const usedLetters = Object.values(state.roundScores).map((_, i) => state.currentLetter).filter(Boolean);
    const newState = startRound(state, usedLetters);
    await updateGameState(roomId, newState);
    await updateRoomStatus(roomId, "active");
    setAnswers({ name: "", place: "", animal: "", thing: "" });
  };

  const handleSubmit = async (auto = false) => {
    if (submitted && !auto) return;

    if (!auto) {
      const invalid = Object.entries(answers).some(([cat, val]) => {
        const trimmed = val.trim();
        return trimmed.length > 0 && trimmed.charAt(0).toUpperCase() !== state.currentLetter;
      });
      if (invalid) {
        if (!confirm(`Warning: Some of your answers do not start with the letter "${state.currentLetter}". Submit anyway?`)) {
          return;
        }
      }
    }

    setSubmitted(true);
    const newState = submitAnswers(state, user.uid, answers as import("@/types").RoundAnswers);
    await updateGameState(roomId, newState);

    // If all players submitted, calculate scores (host does it)
    if (isHost) {
      const allSubmitted = playerUids.every(
        (uid) => newState.answers[uid] !== undefined
      );
      if (allSubmitted) {
        const scored = calculateScores(newState, playerUids);
        await updateGameState(roomId, scored);
        if (scored.winner) await updateRoomStatus(roomId, "finished");
      }
    }
  };

  const handleNextRound = async () => {
    const usedLetters: string[] = [];
    const newState = startRound(state, usedLetters);
    await updateGameState(roomId, newState);
    setAnswers({ name: "", place: "", animal: "", thing: "" });
    setSubmitted(false);
  };

  const handleNewGame = async () => {
    const { initialNamePlaceState } = await import("@/lib/games/name-place");
    const s = initialNamePlaceState(state.totalRounds, state.timerSeconds);
    s.scores = Object.fromEntries(room.players.map(p => [p.uid, 0]));
    await updateGameState(roomId, s);
    await updateRoomStatus(roomId, "waiting");
    setAnswers({ name: "", place: "", animal: "", thing: "" });
    setSubmitted(false);
  };

  const handleLeaveMatch = async () => {
    if (user) {
      await leaveRoom(roomId, user.uid);
    }
    router.push("/");
  };

  const winnerPlayer = room.players.find((p) => p.uid === state.winner);
  const winMessage = state.winner === "draw"
    ? "🤝 It's a draw!"
    : winnerPlayer ? `🎉 ${winnerPlayer.displayName} wins!` : "";

  const timerPct = (timeLeft / state.timerSeconds) * 100;
  const timerColor = timerPct > 50 ? "#1F4E79" : timerPct > 25 ? "#FFA500" : "#FF6B6B";

  return (
    <div className="max-w-4xl mx-auto px-4 pl-6 sm:pl-24 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button onClick={handleLeaveMatch} className="font-hand text-pencil/80 hover:text-ink transition-colors cursor-pointer">
          ← Leave Room
        </button>
        <h1 className="sr-only">Name Place Animal Thing Game Room {roomId}</h1>
        <RoomCodeDisplay code={roomId} />
        <div className="font-hand text-sm text-pencil/80">
          Round {state.round}/{state.totalRounds}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Letter display */}
          {state.roundStatus === "answering" && (
            <div
              className="sticky-card p-6 text-center"
              style={{ "--card-rot": "-1deg", backgroundColor: "var(--card-green)" } as React.CSSProperties}
            >
              <p className="font-hand text-sm text-pencil/80 mb-1">Letter</p>
              <p className="font-hand text-7xl font-bold text-ink">{state.currentLetter}</p>
              {/* Timer */}
              <div className="mt-3 relative h-2 bg-blue-lines/30 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                  style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
                />
              </div>
              <p className="font-hand text-sm mt-1" style={{ color: timerColor }}>
                {timeLeft}s
              </p>
            </div>
          )}

          {/* Scores */}
          <div className="space-y-2">
            {room.players.map((p) => (
              <PlayerBadge
                key={p.uid}
                player={{ ...p, score: state.scores[p.uid] || 0 }}
                isHost={p.uid === room.hostId}
              />
            ))}
          </div>
        </div>

        {/* Main area */}
        <div className="md:col-span-2">
          {/* Waiting to start */}
          {state.roundStatus === "waiting" && (
            <div
              className="sticky-card p-8 text-center"
              style={{ "--card-rot": "0.5deg", backgroundColor: "var(--card-yellow)" } as React.CSSProperties}
            >
              <span className="text-5xl block mb-4">📝</span>
              <h2 className="font-hand text-3xl font-bold text-ink mb-2">
                {state.round === 0 ? "Ready to play?" : "Round over!"}
              </h2>
              {isHost ? (
                <button onClick={handleStartRound} className="sketch-btn-primary sketch-btn px-8 py-3 text-xl mt-4">
                  {state.round === 0 ? "Start Game!" : "Next Round →"}
                </button>
              ) : (
                <p className="font-hand text-pencil/95 mt-4">Waiting for host to start...</p>
              )}
            </div>
          )}

          {/* Answering */}
          {state.roundStatus === "answering" && (
            <div
              className="sticky-card p-6"
              style={{ "--card-rot": "-0.5deg", backgroundColor: "var(--paper)" } as React.CSSProperties}
            >
              <h2 className="font-hand text-2xl font-bold text-ink mb-1 text-center">
                Words starting with &quot;{state.currentLetter}&quot;
              </h2>
              <p className="font-hand text-pencil/80 text-sm text-center mb-4">
                {submitted ? "✓ Submitted! Waiting for others..." : "Fill in as many as you can!"}
              </p>
              <div className="space-y-3">
                {CATEGORIES.map((cat) => (
                  <div key={cat} className="flex items-center gap-3">
                    <label htmlFor={`input-${cat}`} className="font-hand text-ink text-base w-24 flex-shrink-0">
                      {CAT_LABELS[cat]}
                    </label>
                    <input
                      id={`input-${cat}`}
                      type="text"
                      className="notebook-input flex-1"
                      value={answers[cat]}
                      onChange={(e) => setAnswers((a) => ({ ...a, [cat]: e.target.value }))}
                      disabled={submitted}
                      placeholder={`${state.currentLetter}...`}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitted}
                className="sketch-btn-primary sketch-btn w-full mt-5 py-3 text-lg"
              >
                {submitted ? "✓ Submitted!" : "🛑 STOP! Submit Answers"}
              </button>
            </div>
          )}

          {/* Scoring */}
          {state.roundStatus === "scoring" && (
            <div
              className="sticky-card p-6"
              style={{ "--card-rot": "0.5deg", backgroundColor: "var(--card-blue)" } as React.CSSProperties}
            >
              <h2 className="font-hand text-2xl font-bold text-ink mb-4 text-center">
                Round {state.round} Results
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full font-hand text-sm">
                  <thead>
                    <tr className="border-b-2 border-blue-lines">
                      <th className="text-left pb-2 text-pencil/80">Category</th>
                      {room.players.map((p) => (
                        <th key={p.uid} className="pb-2 text-ink">{p.displayName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORIES.map((cat) => (
                      <tr key={cat} className="border-b border-blue-lines/30">
                        <td className="py-1 text-pencil/90">{CAT_LABELS[cat]}</td>
                        {room.players.map((p) => (
                          <td key={p.uid} className="py-1 text-center text-ink">
                            {state.answers[p.uid]?.[cat] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="pt-2 text-ink">Points</td>
                      {room.players.map((p) => {
                        const roundKey = `round_${state.round}`;
                        const pts = (state.roundScores[roundKey] || {})[p.uid] || 0;
                        return (
                          <td key={p.uid} className="pt-2 text-center text-ink">+{pts}</td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              {isHost && (
                <button onClick={handleNextRound} className="sketch-btn-primary sketch-btn w-full mt-4 py-2">
                  Next Round →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <WinBurst
        show={isOver && showWinOverlay}
        message={winMessage}
        onClose={isHost ? handleNewGame : () => setShowWinOverlay(false)}
        onCloseLabel={isHost ? "Play Again" : "Close"}
      />
      <ChatBox roomId={roomId} isHost={isHost} />
    </div>
  );
}
