"use client";
import { useState } from "react";
import GameLobby from "@/components/games/GameLobby";

export default function SOSLobbyPage() {
  const [gridSize, setGridSize] = useState(4);
  return (
    <GameLobby
      gameType="sos"
      title="SOS"
      icon="🆘"
      description="Spell S-O-S on the grid. Most sequences wins!"
      color="#FFE4E4"
      settings={{ gridSize }}
      settingsUI={
        <div>
          <label className="font-hand text-ink text-sm block mb-1">
            Grid Size: {gridSize}×{gridSize}
          </label>
          <input
            type="range"
            min={3}
            max={6}
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="w-full accent-ink"
          />
          <div className="flex justify-between text-xs text-pencil/90 font-hand mt-1">
            <span>3×3</span><span>4×4</span><span>5×5</span><span>6×6</span>
          </div>
        </div>
      }
    />
  );
}
