"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAsGuest, loginWithGoogle, randomGuestName } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [guestName, setGuestName] = useState(randomGuestName());
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Already logged in
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (!loading && user) {
    return null;
  }

  const handleGuest = async () => {
    if (!guestName.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      await loginAsGuest(guestName.trim());
      router.replace("/");
    } catch {
      setError("Couldn't sign in as guest. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      router.replace("/");
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pl-6 sm:pl-24">
      <div
        className="sticky-card w-full max-w-sm p-8 fade-in-up"
        style={{ "--card-rot": "-1deg", backgroundColor: "var(--card-yellow)" } as React.CSSProperties}
      >
        {/* Tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 rounded-sm opacity-60 bg-blue-lines border border-blue-lines/50" />

        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">📓</span>
          <h1 className="font-hand text-3xl font-bold text-ink mb-1">
            Join the Game
          </h1>
          <p className="text-sm text-pencil/95">Pick a name and start playing</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-margin/30 rounded text-red-margin text-sm font-hand text-center">
            {error}
          </div>
        )}

        {/* Guest name */}
        <div className="mb-6">
          <label htmlFor="nickname-input" className="font-hand text-ink text-base block mb-2">
            ✏️ Your nickname
          </label>
          <div className="flex gap-2 items-end">
            <input
              id="nickname-input"
              type="text"
              className="notebook-input flex-1"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              maxLength={24}
              placeholder="Pencil Pete..."
              onKeyDown={(e) => e.key === "Enter" && handleGuest()}
            />
            <button
              onClick={() => setGuestName(randomGuestName())}
              className="text-xl opacity-40 hover:opacity-80 transition-opacity pb-1"
              title="Randomize name"
            >
              🎲
            </button>
          </div>
        </div>

        <button
          onClick={handleGuest}
          disabled={isLoading || !guestName.trim()}
          className="sketch-btn-primary sketch-btn w-full mb-3 py-3 text-lg"
        >
          {isLoading ? "Writing name..." : "🖊️ Play as Guest"}
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-blue-lines flex-1" />
          <span className="text-pencil/90 text-xs font-hand">or</span>
          <div className="h-px bg-blue-lines flex-1" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={isLoading}
          className="sketch-btn w-full py-3 text-base flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <p className="text-center text-xs text-pencil/65 mt-4 font-hand">
          No account needed to play!
        </p>
      </div>
    </div>
  );
}
