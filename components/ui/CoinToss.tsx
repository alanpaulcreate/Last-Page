"use client";
import React, { useEffect, useState } from "react";
import { TossState, Player, GameType } from "@/types";
import { updateGameState, updateRoomStatus } from "@/lib/firestore";
import { PencilIcon } from "@/components/ui/Icons";
import RoomCodeDisplay from "@/components/ui/RoomCodeDisplay";

interface CoinTossProps {
  roomId: string;
  toss: TossState;
  players: Player[];
  userId: string;
  displayName: string;
  gameType: GameType;
  gameState: any;
}

export default function CoinToss({
  roomId,
  toss,
  players,
  userId,
  displayName,
  gameType,
  gameState,
}: CoinTossProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [localSide, setLocalSide] = useState<"heads" | "tails" | null>(null);

  useEffect(() => {
    if (toss.status === "tossing") {
      setIsSpinning(true);
      setShowResult(false);
      setLocalSide(toss.coinSide || null);

      const timer = setTimeout(() => {
        setIsSpinning(false);
        setShowResult(true);

        // The player who initiated the toss handles the final Firestore update
        if (toss.tossedBy === displayName) {
          const finalizeToss = async () => {
            const nextState = { ...gameState };
            nextState.toss = {
              status: "completed",
              coinSide: toss.coinSide,
              winnerUid: toss.winnerUid,
              tossedBy: toss.tossedBy,
            };
            nextState.currentPlayerUid = toss.winnerUid;

            // Apply game-specific starting values
            if (gameType === "tic-tac-toe") {
              nextState.xPlayerUid = toss.winnerUid;
              const other = players.find((p) => p.uid !== toss.winnerUid);
              if (other) {
                nextState.oPlayerUid = other.uid;
              }
            } else if (gameType === "sos" || gameType === "dots-and-boxes") {
              nextState.scores = Object.fromEntries(players.map((p) => [p.uid, 0]));
            }

            await updateGameState(roomId, nextState);
            await updateRoomStatus(roomId, "active");
          };
          finalizeToss();
        }
      }, 2500);

      return () => clearTimeout(timer);
    } else {
      setIsSpinning(false);
      setShowResult(false);
      setLocalSide(null);
    }
  }, [toss.status, toss.coinSide, toss.winnerUid, toss.tossedBy, roomId, players, gameType, displayName, gameState]);

  const handleToss = async () => {
    if (toss.status !== "idle" || players.length < 2) return;

    const side = Math.random() < 0.5 ? "heads" : "tails";
    const winner = players[Math.floor(Math.random() * players.length)];

    const updatedState = {
      ...gameState,
      toss: {
        status: "tossing",
        coinSide: side,
        winnerUid: winner.uid,
        tossedBy: displayName,
        tossedAt: Date.now(),
      },
    };

    await updateGameState(roomId, updatedState);
  };

  const winnerPlayer = players.find((p) => p.uid === toss.winnerUid);

  return (
    <div className="fixed inset-0 bg-pencil/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes coin-3d-spin {
          0% { transform: rotateY(0deg) rotateX(0deg); }
          25% { transform: rotateY(360deg) rotateX(45deg); }
          50% { transform: rotateY(720deg) rotateX(-45deg); }
          75% { transform: rotateY(1080deg) rotateX(30deg); }
          100% { transform: rotateY(1440deg) rotateX(0deg); }
        }
        .animate-coin-spin {
          animation: coin-3d-spin 2.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
      ` }} />

      <div
        className="sticky-card w-full max-w-sm p-6 text-center font-hand relative flex flex-col items-center"
        style={{ backgroundColor: "#FAF7F0" }}
      >
        {/* Tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 rounded-sm opacity-60 bg-blue-lines border border-blue-lines/50" />

        <h2 className="text-2xl font-bold text-ink mb-2">🪙 Starting Toss</h2>
        <p className="text-xs text-pencil/70 mb-4">
          Spin the notebook coin to decide who goes first!
        </p>
        <div className="mb-4 transform scale-90">
          <RoomCodeDisplay code={roomId} />
        </div>

        {/* Coin Area */}
        <div className="h-40 w-40 flex items-center justify-center mb-6 relative">
          <div
            className={`w-32 h-32 rounded-full border-4 border-dashed border-pencil bg-highlight/85 flex flex-col items-center justify-center font-hand text-pencil shadow-sketch select-none transition-transform duration-300 ${
              isSpinning ? "animate-coin-spin" : ""
            }`}
            style={{ transformStyle: "preserve-3d" }}
          >
            {isSpinning ? (
              <span className="text-5xl animate-pulse">🌀</span>
            ) : showResult && localSide ? (
              <>
                <span className="text-4xl">{localSide === "heads" ? "👑" : "⭐"}</span>
                <span className="text-xl font-bold uppercase tracking-wider mt-1">{localSide}</span>
              </>
            ) : (
              <>
                <span className="text-4xl">🪙</span>
                <span className="text-sm font-semibold tracking-wide mt-1">FLIP ME</span>
              </>
            )}
          </div>
        </div>

        {/* Action Status */}
        {toss.status === "idle" && (
          <div className="w-full space-y-3">
            <button
              onClick={handleToss}
              disabled={players.length < 2}
              className="sketch-btn-primary sketch-btn w-full py-2.5 text-lg cursor-pointer"
            >
              Toss Coin
            </button>
            {players.length < 2 && (
              <p className="text-red-margin text-xs font-semibold animate-pulse">
                Waiting for players to join...
              </p>
            )}
          </div>
        )}

        {toss.status === "tossing" && (
          <div className="text-pencil/80 italic animate-pulse text-sm">
            {toss.tossedBy} tossed the coin! Spinning...
          </div>
        )}

        {showResult && winnerPlayer && (
          <div className="space-y-1">
            <p className="text-green-600 font-bold text-lg animate-bounce">
              Landed on {toss.coinSide}!
            </p>
            <p className="text-ink font-semibold text-sm flex items-center justify-center gap-1.5">
              <PencilIcon size={16} className="inline-block" /> {winnerPlayer.displayName} goes first!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
