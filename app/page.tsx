"use client";
import { GameCardInfo } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";

const GAMES: GameCardInfo[] = [
  {
    type: "hangman",
    title: "Hangman",
    description: "Guess the word before the stick figure meets his fate!",
    icon: "🪢",
    color: "var(--card-yellow)",
    rotation: "-2deg",
    players: "2 players",
  },
  {
    type: "sos",
    title: "SOS",
    description: "Spell S-O-S on the grid to score points. Most SOS wins!",
    icon: "🆘",
    color: "var(--card-red)",
    rotation: "1.5deg",
    players: "2 players",
  },
  {
    type: "dots-and-boxes",
    title: "Dots & Boxes",
    description: "Draw lines, complete boxes, claim the most territory!",
    icon: "⬛",
    color: "var(--card-blue)",
    rotation: "-1deg",
    players: "2 players",
  },
  {
    type: "name-place",
    title: "Name Place Animal Thing",
    description: "A letter drops — fill in Name, Place, Animal & Thing fast!",
    icon: "📝",
    color: "var(--card-green)",
    rotation: "2deg",
    players: "2–4 players",
  },
];

const GAME_PATHS: Record<string, string> = {
  hangman: "/games/hangman",
  sos: "/games/sos",
  "dots-and-boxes": "/games/dots-and-boxes",
  "name-place": "/games/name-place",
};

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-6 pl-6 sm:pl-24 py-12">
      {/* Header */}
      <div className="text-center mb-14 fade-in-up">
        {/* Center hero logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/home.logo.png"
            alt="Last Page"
            width={220}
            height={220}
            className="object-contain drop-shadow-md w-[180px] sm:w-[220px] lg:w-[280px] h-auto"
            priority
          />
        </div>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px bg-blue-lines flex-1 max-w-16" />
          <span className="text-pencil/90 text-sm font-hand">pick a game</span>
          <div className="h-px bg-blue-lines flex-1 max-w-16" />
        </div>
        {user && (
          <div className="text-center mt-3 text-sm font-hand text-pencil/95">
            Logged in as <span className="text-ink font-semibold">{user.displayName}</span>
            <button
              onClick={() => logout()}
              className="ml-2 hover:text-red-margin underline font-semibold transition-colors"
            >
              (Sign Out)
            </button>
          </div>
        )}
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {GAMES.map((game, i) => (
          <Link
            key={game.type}
            href={GAME_PATHS[game.type]}
            className="block group"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div
            className="sticky-card pencil-shade p-6 lg:p-8 cursor-pointer fade-in-up"
            style={{
              "--card-rot": game.rotation,
              backgroundColor: game.color,
              animationDelay: `${i * 0.08}s`,
              opacity: 0,
            } as React.CSSProperties}
          >
            {/* Tape strip at top */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 rounded-sm opacity-60"
              style={{ background: "rgba(191,215,255,0.8)", border: "1px solid rgba(191,215,255,0.5)" }}
            />

            <div className="flex flex-col h-56 justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl lg:text-4xl group-hover:animate-bounce-slow flex-shrink-0">
                    {game.icon}
                  </span>
                  <h2
                    className="text-2xl lg:text-3xl font-bold text-ink"
                    style={{ fontFamily: "'Caveat', cursive", lineHeight: "1.1" }}
                  >
                    {game.title}
                  </h2>
                </div>
                <p className="text-sm lg:text-base text-pencil/90 leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-blue-lines/40">
                <span
                  className="text-xs lg:text-sm text-pencil/80 font-hand"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  👥 {game.players}
                </span>
                <span
                  className="sketch-btn text-xs py-1 px-2.5 group-hover:bg-ink group-hover:text-paper transition-colors"
                >
                  Play →
                </span>
              </div>
            </div>

            {/* Ruled lines decoration */}
            <div className="mt-4 space-y-2 opacity-20">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-px bg-blue-lines" />
              ))}
            </div>
          </div>
          </Link>
        ))}
      </div>

      {/* Footer tagline */}
      <div className="text-center mt-16 text-pencil/95">
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem" }}>
          ✏️ Doodled with ♥ — no rulers, no teachers, just games.
        </p>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem" }} className="mt-1 text-pencil/95">
          by <span className="font-semibold tracking-wide">asq.create</span>
        </p>
      </div>
    </div>
  );
}
