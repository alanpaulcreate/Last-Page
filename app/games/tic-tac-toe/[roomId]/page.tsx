"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { useAuth } from "@/hooks/useAuth";
import { updateGameState, updateRoomStatus, leaveRoom } from "@/lib/firestore";
import { TicTacToeState } from "@/types";
import { makeMove } from "@/lib/games/tic-tac-toe";
import PlayerBadge from "@/components/ui/PlayerBadge";
import RoomCodeDisplay from "@/components/ui/RoomCodeDisplay";
import WinBurst from "@/components/ui/WinBurst";
import ChatBox from "@/components/ui/ChatBox";
import CoinToss from "@/components/ui/CoinToss";
import { PencilIcon } from "@/components/ui/Icons";
import InGameApproval from "@/components/games/InGameApproval";

export default function TicTacToeGamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { room, loading } = useRoom(roomId);
  const { user } = useAuth();
  const router = useRouter();
  const [showWinOverlay, setShowWinOverlay] = useState(true);

  const state = room?.gameState as TicTacToeState | undefined;
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

  // Assign toss state once both players have joined
  useEffect(() => {
    if (loading || !room || room.players.length < 2 || !user) return;
    const state = room.gameState as TicTacToeState;
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
        <div className="font-hand text-ink text-2xl animate-pulse">
          Opening game notebook...
        </div>
      </div>
    );
  }

  const isHost = room.hostId === user.uid;
  const isMyTurn = state.currentPlayerUid === user.uid;
  const myMark = user.uid === state.xPlayerUid ? "X" : user.uid === state.oPlayerUid ? "O" : null;

  const handleCellClick = async (index: number) => {
    if (!isMyTurn || isOver || state.grid[index] !== null) return;
    const playerUids = room.players.map((p) => p.uid);
    const newState = makeMove(state, index, playerUids);
    await updateGameState(roomId, newState);
    if (newState.winner) {
      await updateRoomStatus(roomId, "finished");
    }
  };

  const handleNewGame = async () => {
    const { initialTicTacToeState } = await import("@/lib/games/tic-tac-toe");
    const s = initialTicTacToeState();
    s.toss = { status: "idle" };
    await updateGameState(roomId, s);
    await updateRoomStatus(roomId, "waiting");
  };

  const handleLeaveMatch = async () => {
    await leaveRoom(roomId, user.uid);
    router.push("/");
  };

  const winnerPlayer = room.players.find((p) => p.uid === state.winner);
  const winMessage = state.winner === "draw"
    ? "🤝 It's a draw!"
    : winnerPlayer
    ? `🎉 ${winnerPlayer.displayName} (${state.winner === state.xPlayerUid ? "X" : "O"}) wins!`
    : "";

  return (
    <div className="max-w-4xl mx-auto px-4 pl-6 sm:pl-24 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button
          onClick={handleLeaveMatch}
          className="font-hand text-pencil/80 hover:text-ink transition-colors cursor-pointer"
        >
          ← Leave Room
        </button>
        <h1 className="sr-only">Tic-tac-toe Room {roomId}</h1>
        <RoomCodeDisplay code={roomId} />
        <div className="font-hand text-sm text-pencil/80">
          Tic-tac-toe
        </div>
      </div>

      {room.players.length < 2 ? (
        <div className="text-center py-12">
          <p className="font-hand text-2xl text-ink animate-pulse mb-2">
            Waiting for a friend to join...
          </p>
          <p className="text-sm text-pencil/80 font-hand">
            Give them the room code above to start playing!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel: players */}
          <div className="space-y-4">
            <h2 className="font-hand text-xl font-bold text-ink mb-1">Players</h2>
            {room.players.map((p) => {
              const pMark = p.uid === state.xPlayerUid ? "X" : p.uid === state.oPlayerUid ? "O" : "";
              return (
                <div key={p.uid} className="relative">
                  <PlayerBadge
                    player={p}
                    isHost={p.uid === room.hostId}
                    isCurrentTurn={state.currentPlayerUid === p.uid}
                  />
                  {pMark && (
                    <span className="absolute top-1 right-2 font-hand text-lg font-bold text-ink">
                      {pMark}
                    </span>
                  )}
                </div>
              );
            })}

            <div className="p-4 bg-paper/60 rounded border border-blue-lines/30 text-left font-hand">
              <p className="text-sm text-pencil/90 leading-relaxed">
                You are playing as: <strong className="text-ink text-base">{myMark || "Spectator"}</strong>
              </p>
              {isMyTurn && !isOver && (
                <p className="text-xs text-green-600 font-semibold mt-1 animate-pulse flex items-center gap-1">
                  <PencilIcon size={14} className="inline-block" /> Your turn! Click an empty cell.
                </p>
              )}
              {!isMyTurn && !isOver && (
                <p className="text-xs text-pencil/70 mt-1">
                  Waiting for player's move...
                </p>
              )}
            </div>
          </div>

          {/* Center panel: 3x3 Grid board */}
          <div className="md:col-span-2 flex justify-center items-center py-6">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 select-none">
              {/* Hand-drawn Grid lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                {state.grid.map((cell, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(idx)}
                    disabled={!isMyTurn || cell !== null || isOver}
                    className={`flex items-center justify-center border-none bg-transparent hover:bg-ink/5 transition-colors cursor-pointer outline-none font-hand text-4xl sm:text-5xl font-bold text-ink`}
                  >
                    {cell === "X" && (
                      <span className="fade-in text-ink scale-110">X</span>
                    )}
                    {cell === "O" && (
                      <span className="fade-in text-red-margin scale-110">O</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Grid outline lines (mimicking sketchboard look) */}
              {/* Horizontal line 1 */}
              <div className="absolute top-1/3 left-2 right-2 h-0.5 bg-ink/80 rounded" />
              {/* Horizontal line 2 */}
              <div className="absolute top-2/3 left-2 right-2 h-0.5 bg-ink/80 rounded" />
              {/* Vertical line 1 */}
              <div className="absolute left-1/3 top-2 bottom-2 w-0.5 bg-ink/80 rounded" />
              {/* Vertical line 2 */}
              <div className="absolute left-2/3 top-2 bottom-2 w-0.5 bg-ink/80 rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Win/Lose overlay */}
      <WinBurst
        show={isOver && showWinOverlay}
        message={winMessage}
        onClose={isHost ? handleNewGame : () => setShowWinOverlay(false)}
        onCloseLabel={isHost ? "Play Again" : "Close"}
      />

      {state.toss && state.toss.status !== "completed" && (
        <CoinToss
          roomId={roomId}
          toss={state.toss}
          players={room.players}
          userId={user.uid}
          displayName={user.displayName || "Anonymous"}
          gameType="tic-tac-toe"
          gameState={state}
        />
      )}

      <ChatBox roomId={roomId} isHost={isHost} />
      <InGameApproval roomId={roomId} joinRequests={room.joinRequests || []} isHost={isHost} />
    </div>
  );
}
