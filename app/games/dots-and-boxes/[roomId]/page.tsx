"use client";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { useAuth } from "@/hooks/useAuth";
import { updateGameState, updateRoomStatus, leaveRoom } from "@/lib/firestore";
import { DotsState } from "@/types";
import { claimLine, LineType } from "@/lib/games/dots-and-boxes";
import PlayerBadge from "@/components/ui/PlayerBadge";
import RoomCodeDisplay from "@/components/ui/RoomCodeDisplay";
import WinBurst from "@/components/ui/WinBurst";
import ChatBox from "@/components/ui/ChatBox";
import Link from "next/link";
import { useEffect } from "react";

export default function DotsGamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { room, loading } = useRoom(roomId);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, user, router]);

  if (loading || !room || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-hand text-2xl text-ink animate-pulse">
          {loading ? "Drawing dots..." : "Room not found!"}
        </p>
      </div>
    );
  }

  const state = room.gameState as DotsState;
  const playerUids = room.players.map((p) => p.uid);
  const isMyTurn = state.currentPlayerUid === user.uid || state.currentPlayerUid === "";
  const isOver = state.winner !== null;
  const n = state.gridSize;

  const handleLine = async (type: LineType, row: number, col: number) => {
    if (!isMyTurn || isOver) return;
    const initState = state.currentPlayerUid === ""
      ? { ...state, currentPlayerUid: user.uid, scores: Object.fromEntries(room.players.map(p => [p.uid, 0])) }
      : state;
    const newState = claimLine(initState, type, row, col, user.uid, playerUids);
    await updateGameState(roomId, newState);
    if (newState.winner) await updateRoomStatus(roomId, "finished");
  };

  const handleNewGame = async () => {
    const { initialDotsState } = await import("@/lib/games/dots-and-boxes");
    const s = initialDotsState(state.gridSize);
    s.currentPlayerUid = room.players[0].uid;
    s.scores = Object.fromEntries(room.players.map(p => [p.uid, 0]));
    await updateGameState(roomId, s);
    await updateRoomStatus(roomId, "active");
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

  const DOT_SIZE = 10;
  const CELL_SIZE = 52;
  const PAD = 16;
  const svgSize = (n - 1) * CELL_SIZE + 2 * PAD + DOT_SIZE;

  const getPlayerColor = (uid: string | null) => {
    const p = room.players.find(pl => pl.uid === uid);
    return p?.color || "#BFD7FF";
  };

  const currentPlayer = room.players.find(p => p.uid === state.currentPlayerUid);

  return (
    <div className="max-w-4xl mx-auto px-4 pl-6 sm:pl-24 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link href="/games/dots-and-boxes" className="font-hand text-pencil/80 hover:text-ink transition-colors">
          ← Dots & Boxes
        </Link>
        <h1 className="sr-only">Dots and Boxes Game Room {roomId}</h1>
        <RoomCodeDisplay code={roomId} />
        <div className="font-hand text-sm text-pencil/80">
          {n}×{n} dots
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <div
            className="sticky-card p-3 text-center"
            style={{ "--card-rot": "1deg", backgroundColor: "var(--card-yellow)" } as React.CSSProperties}
          >
            <p className="font-hand text-xs text-pencil/80 mb-1">Current Turn</p>
            <p className="font-hand text-ink text-lg font-bold">
              {isMyTurn ? "✏️ Your turn!" : `⏳ ${currentPlayer?.displayName || "Waiting..."}`}
            </p>
          </div>
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
          <div className="font-hand text-center text-sm text-pencil/90">
            {(n-1)*(n-1) - Object.values(state.boxes).flat().filter(Boolean).length} boxes remaining
          </div>
        </div>

        {/* SVG Grid */}
        <div className="md:col-span-2">
          <div
            className="sticky-card p-4 overflow-auto"
            style={{ "--card-rot": "0.5deg", backgroundColor: "var(--card-blue)" } as React.CSSProperties}
          >
            <svg
              width={svgSize}
              height={svgSize}
              className="mx-auto block"
              style={{ maxWidth: "100%" }}
            >
              {/* Boxes */}
              {state.boxes.map((row, ri) =>
                row.map((owner, ci) =>
                  owner ? (
                    <rect
                      key={`box-${ri}-${ci}`}
                      x={PAD + ci * CELL_SIZE + DOT_SIZE / 2}
                      y={PAD + ri * CELL_SIZE + DOT_SIZE / 2}
                      width={CELL_SIZE - DOT_SIZE}
                      height={CELL_SIZE - DOT_SIZE}
                      fill={getPlayerColor(owner)}
                      opacity={0.4}
                      className="box-claimed"
                    />
                  ) : null
                )
              )}

              {/* Horizontal lines */}
              {state.hLines.map((row, ri) =>
                row.map((claimed, ci) => (
                  <line
                    key={`h-${ri}-${ci}`}
                    x1={PAD + ci * CELL_SIZE + DOT_SIZE}
                    y1={PAD + ri * CELL_SIZE + DOT_SIZE / 2}
                    x2={PAD + (ci + 1) * CELL_SIZE}
                    y2={PAD + ri * CELL_SIZE + DOT_SIZE / 2}
                    stroke={claimed ? getPlayerColor(state.hLineOwner[ri][ci]) : "#1F4E79"}
                    strokeWidth={claimed ? 4 : 3}
                    strokeLinecap="round"
                    className={`dot-line ${claimed ? "claimed" : ""} focus:stroke-red-margin focus:outline-none`}
                    onClick={() => !claimed && handleLine("h", ri, ci)}
                    style={{ cursor: claimed || !isMyTurn ? "default" : "pointer" }}
                    tabIndex={claimed || !isMyTurn ? -1 : 0}
                    role="button"
                    aria-label={`Horizontal line, row ${ri + 1}, column ${ci + 1}`}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && !claimed) {
                        e.preventDefault();
                        handleLine("h", ri, ci);
                      }
                    }}
                  />
                ))
              )}

              {/* Vertical lines */}
              {state.vLines.map((row, ri) =>
                row.map((claimed, ci) => (
                  <line
                    key={`v-${ri}-${ci}`}
                    x1={PAD + ci * CELL_SIZE + DOT_SIZE / 2}
                    y1={PAD + ri * CELL_SIZE + DOT_SIZE}
                    x2={PAD + ci * CELL_SIZE + DOT_SIZE / 2}
                    y2={PAD + (ri + 1) * CELL_SIZE}
                    stroke={claimed ? getPlayerColor(state.vLineOwner[ri][ci]) : "#1F4E79"}
                    strokeWidth={claimed ? 4 : 3}
                    strokeLinecap="round"
                    className={`dot-line ${claimed ? "claimed" : ""} focus:stroke-red-margin focus:outline-none`}
                    onClick={() => !claimed && handleLine("v", ri, ci)}
                    style={{ cursor: claimed || !isMyTurn ? "default" : "pointer" }}
                    tabIndex={claimed || !isMyTurn ? -1 : 0}
                    role="button"
                    aria-label={`Vertical line, row ${ri + 1}, column ${ci + 1}`}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && !claimed) {
                        e.preventDefault();
                        handleLine("v", ri, ci);
                      }
                    }}
                  />
                ))
              )}

              {/* Dots */}
              {Array.from({ length: n }, (_, ri) =>
                Array.from({ length: n }, (_, ci) => (
                  <circle
                    key={`dot-${ri}-${ci}`}
                    cx={PAD + ci * CELL_SIZE + DOT_SIZE / 2}
                    cy={PAD + ri * CELL_SIZE + DOT_SIZE / 2}
                    r={DOT_SIZE / 2}
                    fill="#1F4E79"
                  />
                ))
              )}
            </svg>
          </div>
        </div>
      </div>

      <WinBurst
        show={isOver}
        message={winMessage}
        onClose={room.hostId === user.uid ? handleNewGame : handleLeaveMatch}
        onCloseLabel={room.hostId === user.uid ? "Play Again" : "Leave Match"}
      />
      <ChatBox roomId={roomId} />
    </div>
  );
}
