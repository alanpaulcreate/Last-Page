"use client";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { useAuth } from "@/hooks/useAuth";
import { updateGameState, updateRoomStatus, leaveRoom } from "@/lib/firestore";
import { SOSState, SOSCell } from "@/types";
import { placeLetter } from "@/lib/games/sos";
import PlayerBadge from "@/components/ui/PlayerBadge";
import RoomCodeDisplay from "@/components/ui/RoomCodeDisplay";
import WinBurst from "@/components/ui/WinBurst";
import ChatBox from "@/components/ui/ChatBox";
import Link from "next/link";
import { useState, useEffect } from "react";
import CoinToss from "@/components/ui/CoinToss";
import { PencilIcon } from "@/components/ui/Icons";
import InGameApproval from "@/components/games/InGameApproval";

export default function SOSGamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { room, loading } = useRoom(roomId);
  const { user } = useAuth();
  const router = useRouter();
  const [selectedLetter, setSelectedLetter] = useState<"S" | "O">("S");
  const [showWinOverlay, setShowWinOverlay] = useState(true);

  const state = room?.gameState as SOSState | undefined;
  const isOver = state ? state.winner !== null : false;

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname + window.location.search;
      router.replace(`/auth?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!isOver) {
      setShowWinOverlay(true);
    }
  }, [isOver]);

  // Assign toss state once both players have joined
  useEffect(() => {
    if (loading || !room || room.players.length < 2 || !user) return;
    const state = room.gameState as SOSState;
    if (!state.toss) {
      updateGameState(roomId, {
        ...state,
        toss: { status: "idle" },
      });
    }
  }, [room, roomId, loading, user]);

  if (loading || !room || !user || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-hand text-2xl text-ink animate-pulse">
          {loading ? "Loading..." : "Room not found!"}
        </p>
      </div>
    );
  }

  const playerUids = room.players.map((p) => p.uid);
  const isMyTurn = state.currentPlayerUid === user.uid;
  const currentPlayer = room.players.find((p) => p.uid === state.currentPlayerUid);

  const handleCellClick = async (row: number, col: number) => {
    if (!isMyTurn || isOver || state.grid[row][col] !== null) return;
    const newState = placeLetter(state, row, col, selectedLetter, user.uid, playerUids);
    await updateGameState(roomId, newState);
    if (newState.winner) await updateRoomStatus(roomId, "finished");
  };

  const handleNewGame = async () => {
    const { initialSOSState } = await import("@/lib/games/sos");
    const s = initialSOSState(state.gridSize);
    s.toss = { status: "idle" };
    await updateGameState(roomId, s);
    await updateRoomStatus(roomId, "waiting");
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
    : winnerPlayer
    ? `🎉 ${winnerPlayer.displayName} wins!`
    : "";

  return (
    <div className="max-w-4xl mx-auto px-4 pl-6 sm:pl-24 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button onClick={handleLeaveMatch} className="font-hand text-pencil/80 hover:text-ink transition-colors cursor-pointer">
          ← Leave Room
        </button>
        <h1 className="sr-only">SOS Game Room {roomId}</h1>
        <RoomCodeDisplay code={roomId} />
        <div className="font-hand text-sm text-pencil/80">
          {state.gridSize}×{state.gridSize} grid
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Letter picker */}
          <div
            className="sticky-card p-4"
            style={{ "--card-rot": "-1deg", backgroundColor: "var(--card-red)" } as React.CSSProperties}
          >
            <p className="font-hand text-ink text-sm mb-3 text-center">Choose letter:</p>
            <div className="flex gap-3 justify-center">
              {(["S", "O"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setSelectedLetter(l)}
                  className={`w-14 h-14 font-hand text-3xl font-bold rounded border-2 transition-all ${
                    selectedLetter === l
                      ? "bg-ink text-paper border-ink scale-110"
                      : "border-blue-lines text-ink hover:bg-blue-lines/30"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Turn indicator */}
          <div
            className="sticky-card p-3 text-center"
            style={{ "--card-rot": "1deg", backgroundColor: "var(--card-yellow)" } as React.CSSProperties}
          >
            <p className="font-hand text-xs text-pencil/80 mb-1">Current Turn</p>
            <p className="font-hand text-ink text-lg font-bold">
              {isMyTurn ? (
                <span className="flex items-center justify-center gap-1">
                  <PencilIcon size={18} className="inline-block" /> Your turn!
                </span>
              ) : (
                `⏳ ${currentPlayer?.displayName || "Waiting..."}`
              )}
            </p>
          </div>

          {/* Scores */}
          <div className="space-y-2">
            {room.players.map((p) => (
              <PlayerBadge
                key={p.uid}
                player={{ ...p, score: state.scores[p.uid] || 0 }}
                isHost={p.uid === room.hostId}
                isCurrentTurn={state.currentPlayerUid === p.uid}
              />
            ))}
          </div>

          {/* SOS sequences count */}
          {state.sosSequences.length > 0 && (
            <div className="font-hand text-center text-sm text-pencil/80">
              {state.sosSequences.length} SOS sequence{state.sosSequences.length !== 1 ? "s" : ""} found!
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="md:col-span-2">
          <div
            className="sticky-card p-4"
            style={{ "--card-rot": "0.5deg", backgroundColor: "var(--paper)" } as React.CSSProperties}
          >
            <div
              className="grid gap-1 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${state.gridSize}, 1fr)`,
                maxWidth: `${state.gridSize * 68}px`,
              }}
            >
              {state.grid.map((row, ri) =>
                row.map((cell, ci) => {
                  const isInSOS = state.sosSequences.some((seq) =>
                    seq.cells.some(([r, c]) => r === ri && c === ci)
                  );
                  return (
                    <button
                      id={`cell-${ri}-${ci}`}
                      key={`${ri}-${ci}`}
                      type="button"
                      onClick={() => handleCellClick(ri, ci)}
                      disabled={!!cell || !isMyTurn || isOver}
                      className={`sos-cell aspect-square rounded select-none focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 ${
                        isInSOS ? "bg-highlight border-ink" : ""
                      } ${!cell && isMyTurn && !isOver ? "cursor-pointer" : "cursor-default"}`}
                      style={{ fontSize: "clamp(1rem, 4vw, 1.8rem)" }}
                      aria-label={`Cell at row ${ri + 1}, column ${ci + 1}. ${cell ? `Contains ${cell}` : "Empty"}`}
                      onKeyDown={(e) => {
                        let targetRow = ri;
                        let targetCol = ci;
                        if (e.key === "ArrowUp") targetRow = Math.max(0, ri - 1);
                        else if (e.key === "ArrowDown") targetRow = Math.min(state.gridSize - 1, ri + 1);
                        else if (e.key === "ArrowLeft") targetCol = Math.max(0, ci - 1);
                        else if (e.key === "ArrowRight") targetCol = Math.min(state.gridSize - 1, ci + 1);
                        else return;

                        e.preventDefault();
                        const nextId = `cell-${targetRow}-${targetCol}`;
                        document.getElementById(nextId)?.focus();
                      }}
                    >
                      {cell}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <WinBurst
        show={isOver && showWinOverlay}
        message={winMessage}
        onClose={room.hostId === user.uid ? handleNewGame : () => setShowWinOverlay(false)}
        onCloseLabel={room.hostId === user.uid ? "Play Again" : "Close"}
      />
      {state.toss && state.toss.status !== "completed" && (
        <CoinToss
          roomId={roomId}
          toss={state.toss}
          players={room.players}
          userId={user.uid}
          displayName={user.displayName || "Anonymous"}
          gameType="sos"
          gameState={state}
        />
      )}
      <ChatBox roomId={roomId} isHost={room.hostId === user.uid} />
      <InGameApproval roomId={roomId} joinRequests={room.joinRequests || []} isHost={room.hostId === user.uid} />
    </div>
  );
}
