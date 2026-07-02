"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { useAuth } from "@/hooks/useAuth";
import { updateGameState, updateRoomStatus, leaveRoom } from "@/lib/firestore";
import { BingoState } from "@/types";
import { setupBoard, callNumber, countCompletedLines } from "@/lib/games/bingo";
import PlayerBadge from "@/components/ui/PlayerBadge";
import RoomCodeDisplay from "@/components/ui/RoomCodeDisplay";
import WinBurst from "@/components/ui/WinBurst";
import ChatBox from "@/components/ui/ChatBox";
import CoinToss from "@/components/ui/CoinToss";
import { PencilIcon, DiceIcon } from "@/components/ui/Icons";
import InGameApproval from "@/components/games/InGameApproval";

export default function BingoGamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { room, loading } = useRoom(roomId);
  const { user } = useAuth();
  const router = useRouter();

  // Local Board Configuration
  const [localBoard, setLocalBoard] = useState<(number | null)[]>(Array(25).fill(null));
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [showWinOverlay, setShowWinOverlay] = useState(true);

  const state = room?.gameState as BingoState | undefined;
  const isOver = state ? state.winner !== null : false;

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname + window.location.search;
      router.replace(`/auth?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [loading, user, router]);

  // Reset win overlay state on new game
  useEffect(() => {
    if (!isOver) {
      setShowWinOverlay(true);
    }
  }, [isOver]);

  // Once all joined players submit their boards, transition to the coin toss
  useEffect(() => {
    if (loading || !room || room.players.length < 2 || !user) return;
    const state = room.gameState as BingoState;
    const allPlayersReady = room.players.every((p) => state.readyPlayers.includes(p.uid));
    if (allPlayersReady && state.currentPlayerUid === "" && !state.toss) {
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

  const myBoard2D = state.boards[user.uid];
  const myBoard1D = myBoard2D ? myBoard2D.flat() : null;

  const isReady = state.readyPlayers.includes(user.uid);
  const allPlayersReady = room.players.length >= 2 && room.players.every((p) => state.readyPlayers.includes(p.uid));

  // Helper: auto-generate a randomized board (1-25)
  const handleQuickShuffle = () => {
    const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
    // Fisher-Yates shuffle
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    setLocalBoard(numbers);
    setSelectedCell(null);
  };

  const handleManualPlace = (number: number) => {
    if (selectedCell === null || localBoard.includes(number)) return;
    const newBoard = [...localBoard];
    newBoard[selectedCell] = number;
    setLocalBoard(newBoard);
    setSelectedCell(null);
  };

  const handleCellClick = (index: number) => {
    if (isReady) return;
    setSelectedCell(index);
  };

  const handleClearCell = (index: number) => {
    if (isReady) return;
    const newBoard = [...localBoard];
    newBoard[index] = null;
    setLocalBoard(newBoard);
  };

  const handleLockBoard = async () => {
    if (localBoard.some((cell) => cell === null)) return;
    
    // Convert 1D localBoard array to 2D 5x5 board
    const grid2D: number[][] = [];
    for (let i = 0; i < 5; i++) {
      grid2D.push(localBoard.slice(i * 5, i * 5 + 5) as number[]);
    }

    const newState = setupBoard(state, user.uid, grid2D);
    await updateGameState(roomId, newState);
  };

  const handleCallNumber = async (num: number) => {
    if (!isMyTurn || isOver || !isReady || !allPlayersReady) return;
    const playerUids = room.players.map((p) => p.uid);
    const newState = callNumber(state, num, playerUids);
    await updateGameState(roomId, newState);
    if (newState.winner) {
      await updateRoomStatus(roomId, "finished");
    }
  };

  const handleNewGame = async () => {
    const { initialBingoState } = await import("@/lib/games/bingo");
    const s = initialBingoState();
    await updateGameState(roomId, s);
    await updateRoomStatus(roomId, "active");
    setLocalBoard(Array(25).fill(null));
  };

  const handleLeaveMatch = async () => {
    await leaveRoom(roomId, user.uid);
    router.push("/");
  };

  // Find unused numbers in manual board building
  const unusedNumbers = Array.from({ length: 25 }, (_, i) => i + 1)
    .filter((num) => !localBoard.includes(num));

  // Determine completed lines of current user
  const myCompletedLines = myBoard2D ? countCompletedLines(myBoard2D, state.marked) : 0;

  const winnerPlayer = room.players.find((p) => p.uid === state.winner);
  const winnerBoard = winnerPlayer ? state.boards[winnerPlayer.uid] : null;
  const winnerLines = winnerBoard ? countCompletedLines(winnerBoard, state.marked) : 0;
  const winMessage = state.winner === "draw"
    ? "🤝 It's a draw!"
    : winnerPlayer
    ? `🎉 ${winnerPlayer.displayName} wins BINGO with ${winnerLines} lines!`
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
        <h1 className="sr-only">Bingo Room {roomId}</h1>
        <RoomCodeDisplay code={roomId} />
        <div className="font-hand text-sm text-pencil/80">
          Bingo (1–25)
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
          {/* Left panel: players & stats */}
          <div className="space-y-4">
            <h2 className="font-hand text-xl font-bold text-ink mb-1">Players</h2>
            {room.players.map((p) => {
              const ready = state.readyPlayers.includes(p.uid);
              const pBoard = state.boards[p.uid];
              const lines = pBoard ? countCompletedLines(pBoard, state.marked) : 0;
              return (
                <div key={p.uid} className="relative">
                  <PlayerBadge
                    player={p}
                    isHost={p.uid === room.hostId}
                    isCurrentTurn={state.currentPlayerUid === p.uid && state.currentPlayerUid !== ""}
                  />
                  <div className="absolute top-1 right-2 flex flex-col items-end font-hand text-xs text-pencil/90">
                    {!ready && <span className="text-red-margin font-semibold">Configuring board...</span>}
                    {ready && !state.currentPlayerUid && <span className="text-green-600 font-semibold">Ready!</span>}
                    {ready && state.currentPlayerUid && (
                       <span className="text-ink font-bold">Lines: {lines} / 5</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Instruction board */}
            <div className="p-4 bg-paper/60 rounded border border-blue-lines/30 font-hand">
              {!isReady ? (
                <div className="space-y-2">
                  <h3 className="font-bold text-ink text-base">🔧 Setup Board</h3>
                  <p className="text-xs text-pencil/80 leading-relaxed">
                    Click each cell and assign a number from 1 to 25. Every number must be used exactly once.
                  </p>
                  <button
                    onClick={handleQuickShuffle}
                    className="sketch-btn py-1 px-3 text-xs w-full mt-2"
                  >
                    <DiceIcon size={14} className="inline mr-1" /> Quick Shuffle (Auto-Fill)
                  </button>
                  <button
                    onClick={handleLockBoard}
                    disabled={localBoard.some((cell) => cell === null)}
                    className="sketch-btn-primary sketch-btn py-2 text-sm w-full disabled:opacity-40"
                  >
                    Lock Board & Ready
                  </button>
                </div>
              ) : !allPlayersReady ? (
                <div className="text-center py-4">
                  <p className="text-ink font-semibold animate-pulse text-sm">
                    Board locked. Waiting for other players to lock their boards...
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="font-bold text-ink text-base">🎯 How to Play</h3>
                  <p className="text-xs text-pencil/80 leading-relaxed">
                    Click uncalled numbers on your board when it's your turn. Correct numbers will cross out on all players' grids.
                  </p>
                  {isMyTurn && !isOver && (
                    <p className="text-xs text-green-600 font-semibold mt-1 animate-pulse flex items-center gap-1">
                      <PencilIcon size={14} className="inline-block" /> Your Turn! Call a number.
                    </p>
                  )}
                  {!isMyTurn && !isOver && (
                    <p className="text-xs text-pencil/70 mt-1">
                      Waiting for player's call...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Center board panel */}
          <div className="md:col-span-2 space-y-4">
            {/* BINGO letters header display */}
            {isReady && allPlayersReady && (
              <div className="flex justify-center gap-4 py-2 select-none font-hand text-3xl font-extrabold tracking-widest text-pencil">
                {["B", "I", "N", "G", "O"].map((letter, idx) => {
                  const crossed = myCompletedLines > idx;
                  return (
                    <span
                      key={letter}
                      className={`relative px-2 transition-all ${
                        crossed ? "text-red-margin scale-110 rotate-3" : "text-ink/30"
                      }`}
                    >
                      {letter}
                      {crossed && (
                        <div className="absolute inset-x-0 top-1/2 h-1 bg-red-margin rounded -rotate-12" />
                      )}
                    </span>
                  );
                })}
              </div>
            )}

            {/* 5x5 Game Board */}
            <div className="flex justify-center select-none">
              <div className="grid grid-cols-5 gap-1.5 p-3 bg-paper border-2 border-blue-lines/60 rounded shadow-sketch w-full max-w-sm">
                {/* Rendering setup phase board configuration */}
                {!isReady && localBoard.map((num, idx) => {
                  const isSelected = selectedCell === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleCellClick(idx)}
                      className={`relative flex items-center justify-center aspect-square border border-blue-lines/40 rounded-sm font-hand text-lg cursor-pointer transition-colors ${
                        isSelected ? "bg-highlight/60 border-pencil" : "bg-paper/40 hover:bg-ink/5"
                      }`}
                    >
                      {num !== null ? (
                        <>
                          <span className="text-ink font-bold">{num}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearCell(idx);
                            }}
                            className="absolute -top-1 -right-1 bg-red-margin/90 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center cursor-pointer border-none"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <span className="text-pencil/25 text-xs">?</span>
                      )}
                    </div>
                  );
                })}

                {/* Rendering gameplay board */}
                {isReady && myBoard1D && myBoard1D.map((num) => {
                  const isMarked = state.marked.includes(num);
                  return (
                    <button
                      key={num}
                      onClick={() => handleCallNumber(num)}
                      disabled={!isMyTurn || isMarked || isOver || !allPlayersReady}
                      className={`relative flex items-center justify-center aspect-square border border-blue-lines/40 rounded-sm font-hand text-xl font-bold cursor-pointer transition-all ${
                        isMarked
                          ? "bg-ink text-paper scale-95"
                          : isMyTurn
                          ? "bg-paper hover:bg-ink/5 text-ink"
                          : "bg-paper text-ink/75"
                      }`}
                    >
                      {num}
                      {isMarked && (
                        <div className="absolute inset-0 bg-red-margin/10 flex items-center justify-center pointer-events-none rounded-sm">
                          {/* Sketchy cross checkmark red overlay */}
                          <div className="absolute w-[80%] h-0.5 bg-red-margin/80 rounded rotate-45" />
                          <div className="absolute w-[80%] h-0.5 bg-red-margin/80 rounded -rotate-45" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Unused numbers pad for manual setup */}
            {!isReady && selectedCell !== null && (
              <div className="p-4 bg-paper/60 rounded border border-blue-lines/40 max-w-sm mx-auto">
                <p className="font-hand text-sm text-pencil mb-2 text-center">
                  Select number for cell #{selectedCell + 1}:
                </p>
                <div className="grid grid-cols-6 gap-1.5 justify-center">
                  {unusedNumbers.map((num) => (
                    <button
                      key={num}
                      onClick={() => handleManualPlace(num)}
                      className="sketch-btn py-1 font-hand text-sm text-ink font-bold flex items-center justify-center cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
          gameType="bingo"
          gameState={state}
        />
      )}

      <ChatBox roomId={roomId} isHost={isHost} />
      <InGameApproval roomId={roomId} joinRequests={room.joinRequests || []} isHost={isHost} />
    </div>
  );
}
