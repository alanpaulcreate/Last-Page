"use client";
import { useState } from "react";
import GameLobby from "@/components/games/GameLobby";

export default function NamePlaceLobbyPage() {
  const [rounds, setRounds] = useState(5);
  const [timer, setTimer] = useState(60);
  return (
    <GameLobby
      gameType="name-place"
      title="Name Place Animal Thing"
      icon="📝"
      description="A random letter drops — fill in Name, Place, Animal & Thing before time runs out!"
      color="#E8FFE4"
      maxPlayers={4}
      settings={{ totalRounds: rounds, timerSeconds: timer }}
      settingsUI={
        <div className="space-y-3">
          <div>
            <label className="font-hand text-ink text-sm block mb-1">
              Rounds: {rounds}
            </label>
            <input
              type="range" min={3} max={10} value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full accent-ink"
            />
          </div>
          <div>
            <label className="font-hand text-ink text-sm block mb-1">
              Timer: {timer}s per round
            </label>
            <input
              type="range" min={30} max={120} step={15} value={timer}
              onChange={(e) => setTimer(Number(e.target.value))}
              className="w-full accent-ink"
            />
          </div>
        </div>
      }
    />
  );
}
