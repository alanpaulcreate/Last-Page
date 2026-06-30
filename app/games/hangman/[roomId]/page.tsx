"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { useAuth } from "@/hooks/useAuth";
import { updateGameState, updateRoomStatus, leaveRoom } from "@/lib/firestore";
import { HangmanState } from "@/types";
import { guessLetter, MAX_WRONG_GUESSES, HANGMAN_SVG_PARTS } from "@/lib/games/hangman";
import PlayerBadge from "@/components/ui/PlayerBadge";
import RoomCodeDisplay from "@/components/ui/RoomCodeDisplay";
import WinBurst from "@/components/ui/WinBurst";
import ChatBox from "@/components/ui/ChatBox";
import Link from "next/link";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function HangmanGamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { room, loading } = useRoom(roomId);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-hand text-2xl text-ink animate-pulse">Loading game...</p>
      </div>
    );
  }

  if (!room || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-hand text-2xl text-ink mb-4">Room not found!</p>
          <Link href="/games/hangman" className="sketch-btn-primary sketch-btn">
            Back to Lobby
          </Link>
        </div>
      </div>
    );
  }

  const state = room.gameState as HangmanState;
  const isMyTurn = true; // In hangman, both players can guess
  const isHost = room.hostId === user.uid;
  const isOver = state.winner !== null || state.loser !== null;

  const handleGuess = async (letter: string) => {
    if (state.guessedLetters.includes(letter) || isOver) return;
    const newState = guessLetter(state, letter);
    await updateGameState(roomId, newState);
    if (newState.winner || newState.loser) {
      await updateRoomStatus(roomId, "finished");
    }
  };

  const handleNewGame = async () => {
    const { initialHangmanState } = await import("@/lib/games/hangman");
    await updateGameState(roomId, initialHangmanState());
    await updateRoomStatus(roomId, "active");
  };

  const handleLeaveMatch = async () => {
    await leaveRoom(roomId, user.uid);
    router.push("/");
  };

  const winMessage =
    state.winner
      ? `🎉 You guessed it! The word was "${state.word}"`
      : state.loser
      ? `💀 Game over! The word was "${state.word}"`
      : "";

  return (
    <div className="max-w-4xl mx-auto px-4 pl-6 sm:pl-24 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/games/hangman" className="font-hand text-pencil/80 hover:text-ink transition-colors">
          ← Hangman
        </Link>
        <h1 className="sr-only">Hangman Room {roomId}</h1>
        <RoomCodeDisplay code={roomId} />
        <div className="text-sm font-hand text-pencil/80">
          Category: <span className="text-ink font-semibold">{state.category}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gallows */}
        <div className="md:col-span-1">
          <div
            className="sticky-card p-4"
            style={{ "--card-rot": "-1deg", backgroundColor: "var(--card-yellow)" } as React.CSSProperties}
          >
            <svg width="200" height="220" viewBox="0 0 200 220" className="mx-auto">
              {/* Gallows structure */}
              <line x1="20" y1="210" x2="180" y2="210" stroke="#1F4E79" strokeWidth="4" strokeLinecap="round"/>
              <line x1="60" y1="210" x2="60" y2="20" stroke="#1F4E79" strokeWidth="4" strokeLinecap="round"/>
              <line x1="60" y1="20" x2="150" y2="20" stroke="#1F4E79" strokeWidth="4" strokeLinecap="round"/>
              <line x1="150" y1="20" x2="150" y2="50" stroke="#1F4E79" strokeWidth="3" strokeLinecap="round"/>
              {/* Body parts based on wrong guesses */}
              {HANGMAN_SVG_PARTS.slice(0, state.wrongGuesses).map((part, i) => (
                <g
                  key={i}
                  className="gallows-part"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  dangerouslySetInnerHTML={{ __html: part }}
                />
              ))}
            </svg>
            <div className="text-center mt-2">
              <span className="font-hand text-pencil/80 text-sm">
                {state.wrongGuesses}/{MAX_WRONG_GUESSES} wrong
              </span>
            </div>
          </div>

          {/* Players */}
          <div className="mt-4 space-y-2">
            {room.players.map((p) => (
              <PlayerBadge key={p.uid} player={p} isHost={p.uid === room.hostId} />
            ))}
          </div>
        </div>

        {/* Word + Keyboard */}
        <div className="md:col-span-2 space-y-6">
          {/* Masked word */}
          <div
            className="sticky-card p-6"
            style={{ "--card-rot": "0.5deg", backgroundColor: "var(--card-blue)" } as React.CSSProperties}
          >
            <div className="flex flex-wrap justify-center gap-3">
              {state.maskedWord.map((char, i) => (
                <div
                  key={i}
                  className={`w-10 h-12 flex items-end justify-center border-b-2 border-ink pb-1 ${
                    char !== "_" ? "letter-reveal" : ""
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className="font-hand text-2xl font-bold text-ink">
                    {char === "_" ? "" : char}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Alphabet keyboard */}
          <div
            className="sticky-card p-4"
            style={{ "--card-rot": "-0.5deg", backgroundColor: "var(--paper)" } as React.CSSProperties}
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {ALPHABET.map((letter) => {
                const guessed = state.guessedLetters.includes(letter);
                const isCorrect = guessed && state.word.includes(letter);
                const isWrong = guessed && !state.word.includes(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => handleGuess(letter)}
                    disabled={guessed || isOver}
                    className={`w-11 h-11 font-hand text-base font-bold rounded border-2 transition-all ${
                      isCorrect
                        ? "bg-ink text-paper border-ink"
                        : isWrong
                        ? "bg-pencil/20 text-pencil/65 border-pencil/50 line-through"
                        : "border-blue-lines hover:bg-blue-lines/30 hover:border-ink text-ink cursor-pointer"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wrong guesses display */}
          {state.guessedLetters.filter(l => !state.word.includes(l)).length > 0 && (
            <div className="font-hand text-pencil/80 text-sm text-center">
              ❌ Wrong:{" "}
              {state.guessedLetters
                .filter((l) => !state.word.includes(l))
                .join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* Win/Lose overlay */}
      <WinBurst
        show={isOver}
        message={winMessage}
        onClose={isHost ? handleNewGame : handleLeaveMatch}
        onCloseLabel={isHost ? "Play Again" : "Leave Match"}
      />
      <ChatBox roomId={roomId} />
    </div>
  );
}
