"use client";
import { useState } from "react";
import GameLobby from "@/components/games/GameLobby";

export default function DotsLobbyPage() {
  const [gridSize, setGridSize] = useState(4);
  return (
    <GameLobby
      gameType="dots-and-boxes"
      title="Dots & Boxes"
      icon="⬛"
      description="Draw lines between dots. Complete a box to claim it!"
      color="#E4F0FF"
      settings={{ gridSize }}
      settingsUI={
        <div>
          <label className="font-hand text-ink text-sm block mb-1">
            Grid: {gridSize}×{gridSize} dots ({(gridSize-1)*(gridSize-1)} boxes)
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
