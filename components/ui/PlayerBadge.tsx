import { Player } from "@/types";

interface PlayerBadgeProps {
  player: Player;
  isHost?: boolean;
  isCurrentTurn?: boolean;
}

export default function PlayerBadge({ player, isHost, isCurrentTurn }: PlayerBadgeProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded border-2 transition-all ${
        isCurrentTurn
          ? "border-ink bg-ink/5 shadow-sketch"
          : "border-blue-lines bg-paper/50"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          player.color === "#95E06C" || player.color === "#4ECDC4" ? "text-ink" : "text-white"
        }`}
        style={{ backgroundColor: player.color || "#1F4E79" }}
      >
        {player.displayName.charAt(0).toUpperCase()}
      </div>
      <div>
        <div className="flex items-center gap-1">
          <span className="font-hand text-ink text-base leading-none">
            {player.displayName}
          </span>
          {isHost && (
            <span className="text-xs text-pencil/90 font-hand">(host)</span>
          )}
          {player.isGuest && (
            <span className="text-xs text-pencil/65 font-hand">✏️</span>
          )}
        </div>
        <div className="text-xs text-pencil/80 font-hand">
          Score: {player.score}
        </div>
      </div>
      {isCurrentTurn && (
        <div className="ml-auto text-lg animate-bounce-slow">✏️</div>
      )}
    </div>
  );
}
